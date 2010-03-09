uki.more = {};uki.more.view = {};// really basic tree list implementation
uki.more.view.treeList = {};

uki.more.view.TreeList = uki.newClass(uki.view.List, new function() {
    var Base = uki.view.List.prototype,
        proto = this;

    proto.typeName = function() { return 'uki.more.view.TreeList'; };
    
    proto._setup = function() {
        Base._setup.call(this);
        this._render = new uki.more.view.treeList.Render();
    };
    
    proto.listData = Base.data;

    proto.data = uki.newProp('_treeData', function(v) {
        this._treeData = v;
        this.listData(this._treeNodeToListData(v));
    });

    proto._treeNodeToListData = function(node, indent) {
        indent = indent || 0;
        return uki.map(node, function(row) {
            row.__indent = indent;
            return row;
        });
    };

    proto.toggle = function(index) {
        this._data[index].__opened ? this.close(index) : this.open(index);
    };
    
    function recursiveLength (item) {
        var children = item.children,
            length = children.length;
            
        for (var i=0; i < children.length; i++) {
            if (children[i].__opened) length += recursiveLength(children[i]);
        };
        return length;
    }

    proto.open = function(index, _skipUpdate) {
        var selectedIndex = this._selectedIndex,
            item = this._data[index],
            children = item.children;
            
        if (!children || !children.length || (item.__opened && !_skipUpdate)) return 0;
        var length = children.length;

        item.__opened = true;
        this._data.splice.apply(this._data, [index+1, 0].concat( this._treeNodeToListData(children, item.__indent + 1) ));
        
        for (var i=children.length - 1; i >= 0 ; i--) {
            if (this._data[index+1+i].__opened) {
                length += this.open(index+1+i, true);
            }
        };
        if (!_skipUpdate) {
            this.listData(this._data);
            this.selectedIndex(selectedIndex <= index ? selectedIndex : selectedIndex + length);
        }
        return length;
    };

    proto.close = function(index) {
        var selectedIndex = this._selectedIndex,
            item = this._data[index],
            children = item.children;
            
        if (!children || !children.length || !item.__opened) return;
        var length = recursiveLength(item);

        item.__opened = false;
        this._data.splice(index+1, length);
        this.listData(this._data);
        this.selectedIndex(
                            selectedIndex <= index ? selectedIndex : 
                            selectedIndex >= index + length ? index - length :
                            index
                          );
    };

    proto._mousedown = function(e) {
        if (e.domEvent.target.className.indexOf('toggle-tree') > -1) {
            var o = uki.dom.offset(this._dom),
                y = e.domEvent.pageY - o.y,
                p = y / this._rowHeight << 0;
            this.toggle(p);
        } else {
            Base._mousedown.call(this, e);
        }
    };

    proto._keypress = function(e) {
        Base._keypress.call(this, e);
        e = e.domEvent;
        if (e.which == 39 || e.keyCode == 39) { // RIGHT
            this.open(this._selectedIndex);
        } else if (e.which == 37 || e.keyCode == 37) { // LEFT
            this.close(this._selectedIndex);
        }
    };

});// tree list render
uki.more.view.treeList.Render = uki.newClass(uki.view.list.Render, new function() {
    this._parentTemplate = new uki.theme.Template(
        '<div class="${classPrefix}-row ${classPrefix}-${opened}" style="margin-left:${indent}px">' + 
            '<div class="${classPrefix}-toggle"><i class="toggle-tree"></i></div>${text}' +
        '</div>'
    );

    this._leafTemplate = new uki.theme.Template(
        '<div class="${classPrefix}-row" style="margin-left:${indent}px">${text}</div>'
    );
    
    this.initStyles = function() {
        uki.more.view.treeList.Render.prototype.classPrefix = 'treeList-' + uki.dom.guid++;
        var style = new uki.theme.Template(
            '.${classPrefix}-row { color: #333; position:relative; padding-top:3px; } ' +
            '.${classPrefix}-toggle { overflow: hidden; position:absolute; left:-15px; top:5px; width: 10px; height:9px; } ' +
            '.${classPrefix}-toggle i { display: block; position:absolute; left: 0; top: 0; width:20px; height:18px; background: url(${imageSrc});} ' +
            '.${classPrefix}-selected { background: #3875D7; } ' +
            '.${classPrefix}-selected .${classPrefix}-row { color: #FFF; } ' +
            '.${classPrefix}-selected i { left: -10px; } ' +
            '.${classPrefix}-selected-blured { background: #CCCCCC; } ' +
            '.${classPrefix}-opened i { top: -9px; }'
        ).render({ 
            classPrefix: this.classPrefix, 
            imageSrc: '/i/arrows.png'  // should call uki.image here
        });
        uki.dom.createStylesheet(style);
    };

    this.render = function(row, rect, i) {
        this.classPrefix || this.initStyles();
        var text = row.data;
        if (row.children && row.children.length) {
            return this._parentTemplate.render({ 
                text: text, 
                indent: row.__indent*18 + 22,
                classPrefix: this.classPrefix,
                opened: row.__opened ? 'opened' : ''
            });
        } else {
            return this._leafTemplate.render({ 
                text: text, 
                indent: row.__indent*18 + 22,
                classPrefix: this.classPrefix
            });
        }
    };
    
    this.setSelected = function(container, data, state, focus) {
        container.className = !state ? '' : focus ? this.classPrefix + '-selected' : this.classPrefix + '-selected-blured';
    };
});


uki.more.utils = {
    range: function (from, to) {
        var result = new Array(to - from);
        for (var idx = 0; from <= to; from++, idx++) {
            result[idx] = from;
        };
        return result;
    },
    
    binarySearch: function (array, value) {
        var low = 0, high = array.length, mid;
        while (low < high) {
            mid = (low + high) >> 1;
            array[mid] < value ? low = mid + 1 : high = mid;
        }
        return low;
    }
};uki.more.view.MultiselectList = uki.newClass(uki.view.List, new function() {
    var Base = uki.view.List.prototype,
        proto = this;
        
    proto.typeName = 'uki.more.view.MultiselectList';
        
    proto._setup = function() {
        Base._setup.call(this);
        uki.extend(this, {
            _selectedIndexes: [],
            _lastClickIndex: -1
        });
    };
    
    proto.lastClickIndex = uki.newProp('_lastClickIndex');
    
    proto.clearSelection = function(skipClickIndex) {
        for (var i=0; i < this._selectedIndexes.length; i++) {
            this._setSelected(this._selectedIndexes[i], false);
        };
        this._selectedIndexes = [];
        if (!skipClickIndex) this._lastClickIndex = -1;
    };
    
    proto.selectedIndexes = function(indexes) {
        if (indexes === undefined) return this._selectedIndexes;
        this.clearSelection(true);
        this._selectedIndexes = indexes;
        for (var i=0; i < this._selectedIndexes.length; i++) {
            this._setSelected(this._selectedIndexes[i], true);
        };
        this.trigger('selection', {source: this});
        return this;
    };
    
    proto.selectedIndex = function(position) {
        if (position === undefined) return this._selectedIndexes.length ? this._selectedIndexes[0] : -1;
        this.selectedIndexes([position]);
        this._scrollToPosition(position);
        return this;
    };
    
    function removeRange (array, from, to) {
        var p = uki.more.utils.binarySearch(array, from),
            initialP = p;
        while (array[p] <= to) p++;
        if (p > initialP) array.splice(initialP, p - initialP);
    }
    
    proto._toggleSelection = function(p) {
        var indexes = [].concat(this._selectedIndexes);
        var addTo = uki.more.utils.binarySearch(indexes, p);
        if (indexes[addTo] == p) {
            indexes.splice(addTo, 1);
        } else {
            indexes.splice(addTo, 0, p);
        }
        this.selectedIndexes(indexes);
    };
    
    proto._bindSelectionEvents = function() {
        this.bind('mousedown', this._mousedown);
        
        var ua = navigator.userAgent,
            useKeyPress = /mozilla/i.test( ua ) && !(/(compatible|webkit)/i).test( ua );
            
        this.bind(useKeyPress ? 'keypress' : 'keydown', this._keypress);
    };
    
    proto._mousedown = function(e) {
        var o = uki.dom.offset(this._dom),
            y = e.domEvent.pageY - o.y,
            p = y / this._rowHeight << 0,
            indexes = this._selectedIndexes;
        if (e.domEvent.shiftKey && indexes.length > 0) {
            if (this.isSelected(p)) {
                indexes = [].concat(indexes);
                removeRange(indexes, Math.min(p+1, this._lastClickIndex), Math.max(p-1, this._lastClickIndex));
                this.selectedIndexes(indexes);
            } else {
                this.selectedIndexes(uki.more.utils.range(
                    Math.min(p, indexes[0]),
                    Math.max(p, indexes[indexes.length - 1])
                ));
            }
        } else if (e.domEvent.metaKey) {
            this._toggleSelection(p);
        } else {
            this.selectedIndexes([p]);
        }
        this._lastClickIndex = p;
    };
    
    proto._keypress = function(e) {
        e = e.domEvent;
        var indexes = this._selectedIndexes,
            nextIndex = -1;
        if (e.which == 38 || e.keyCode == 38) { // UP
            nextIndex = Math.max(0, this._lastClickIndex - 1);
        } else if (e.which == 40 || e.keyCode == 40) { // DOWN
            nextIndex = Math.min(this._data.length-1, this._lastClickIndex + 1);
        }
        if (nextIndex > -1 && nextIndex != this._lastClickIndex) {
            if (e.shiftKey) {
                if (this.isSelected(nextIndex)) {
                    this._toggleSelection(this._lastClickIndex);
                } else {
                    this._toggleSelection(nextIndex);
                }
            } else {
                this.selectedIndex(nextIndex);
            }
            this._lastClickIndex = nextIndex;
            uki.dom.preventDefault(e);
        }
    };
    
    proto.isSelected = function(index) {
        var found = uki.more.utils.binarySearch(this._selectedIndexes, index);
        return this._selectedIndexes[found] == index;
    };
    
    //   xxxxx    |    xxxxx  |  xxxxxxxx  |     xxx
    //     yyyyy  |  yyyyy    |    yyyy    |   yyyyyyy
    proto._restorePackSelection = function(pack) {
        var indexes = this._selectedIndexes;
        
        if (
            (indexes[0] <= pack.itemFrom && indexes[indexes.length - 1] >= pack.itemFrom) || // left index
            (indexes[0] <= pack.itemTo   && indexes[indexes.length - 1] >= pack.itemTo) || // right index
            (indexes[0] >= pack.itemFrom && indexes[indexes.length - 1] <= pack.itemTo) // within
        ) {
            var currentSelection = uki.more.utils.binarySearch(indexes, pack.itemFrom);
            currentSelection = Math.max(currentSelection, 0);
            while(indexes[currentSelection] !== null && indexes[currentSelection] < pack.itemTo) {
                var position = indexes[currentSelection] - pack.itemFrom;
                this._render.setSelected(pack.dom.childNodes[position], this._data[position], true, this.hasFocus());
                currentSelection++;
            }
        }
    };
    
    proto._setSelected = function(position, state) {
        var item = this._itemAt(position);
        if (item) this._render.setSelected(item, this._data[position], state, this.hasFocus());
    };
    
    proto._focus = function() {
        if (this._selectedIndexes.length == 0 && this._data.length > 0) {
            this.selectedIndexes([0]);
        } else {
            this.selectedIndexes(this.selectedIndexes());
        }
    };
    
    proto._blur = function() {
        this.selectedIndexes(this.selectedIndexes());
    };
});

// export properties
uki.Collection.addAttrs('lastClickIndex,selectedIndexes');
uki.delegateProp(uki.view.Table.prototype, 'selectedIndexes', '_list');
uki.delegateProp(uki.view.Table.prototype, 'lastClickIndex', '_list');uki.view.declare('uki.more.view.ToggleButton', uki.view.Button, function(Base) {
    
    this._setup = function() {
        Base._setup.call(this);
        this._focusable = false;
    };
    
    this.value = this.checked = uki.newProp('_checked', function(state) {
        this._checked = !!state;
        this._updateBg();
    });
    
    this._updateBg = function() {
        var name = this._disabled ? 'disabled' : this._down || this._checked ? 'down' : this._over ? 'hover' : 'normal';
        this._backgroundByName(name);
    };
    
    this._mouseup = function(e) {
        if (!this._down) return;
        this._down = false;
        if (!this._disabled) this.checked(!this.checked())
    };
    
});
uki.view.declare('uki.more.view.RadioButton', uki.more.view.ToggleButton, function(base) {
    var manager = uki.view.Radio;
    
    this.group = uki.newProp('_group', function(g) {
        manager.unregisterGroup(this);
        this._group = g;
        manager.registerGroup(this);
        manager.clearGroup(this);
    });
    
    this.value = this.checked = uki.newProp('_checked', function(state) {
        this._checked = !!state;
        if (state) manager.clearGroup(this);
        this._updateBg();
    });
    
    this._mouseup = function() {
        if (!this._down) return;
        this._down = false;
        if (!this._checked && !this._disabled) {
            this.checked(!this._checked);
            this.trigger('change', {checked: this._checked, source: this});
        }
    }
});
