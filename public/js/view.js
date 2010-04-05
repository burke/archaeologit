var JSGITProxy = JSGITProxy || {};

(function(lib){
  lib.html = function(){
    return $('iframe').eq(0).contents().find('html');
  };
})(JSGITProxy);

$(function(){
  var data = data || [],
    repo = document.location.pathname.match(/^\/([^\/)]+)\//)[1];

var render = uki.newClass(uki.more.view.treeList.Render, { setSelected: function(container, data, state, focus) { container.className = state ?  this.classPrefix + '-selected' : '' } })

  var treedFileList = {
    view: 'uki.more.view.TreeList',
      rect: '310 470',
      anchors: 'left top bottom right',
      data: data,
      render: new render(),
      rowHeight: 22,
      style: { fontSize: '12px' } };

  var leftChildViews = [
    {view: 'Box', rect: '0 0 310 35', anchors: 'left top right', background: 'theme(panel)',
       childViews:
         [{ view: 'TextField', rect: '3 5 304 25', anchors: 'left top right', placeholder: 'Search files..'}]
    },
    {view: 'ScrollPane', rect: '0 44 310 556', anchors: 'left top bottom right', childViews: treedFileList}
  ];

  uki.view.JSGIT = uki.newClass(uki.view.Base, new function() {
      this.typeName = function() { return 'uki.view.JSGIT'; };

      this._createDom = function() {
          this._dom = uki.createElement('div', this.defaultCss + 'border:none;left:0;top:0;width:100%;height:100%');
      };

      uki.delegateProp(this, 'src', '_dom');
      this.load = function(path){
        $(this._dom).load('/'+repo+path,function(){
          JSGIT.initialize($("#history").text());
        });
      };

      this._layoutDom = function() {};
  });

  page = uki({
      view: 'HorizontalSplitPane', rect: '1000 600', anchors: 'left top right bottom',
      handlePosition: 310, leftMin: 0, rightMin: 310,
      leftChildViews: leftChildViews,
      rightChildViews: [
        { id: 'viewer',view: 'uki.view.JSGIT', rect: '0 0 683 600', anchors: 'top right left bottom',  background: '#D0D7E2' },
        { view: 'Box', rect: '683 600', anchors: 'left top right bottom', style: { zIndex: 101 }, id: 'dragOverlay', visible: false }]
  })

  // otherwise the iframe steals focus
  page[0]._acceptDrag = function(e) {
    page.find('#dragOverlay').visible(true).layout();
    return uki.view.HorizontalSplitPane.prototype._acceptDrag.call(this, e);
  };

  page[0]._drop = function(e) {
    page.find('#dragOverlay').visible(false);
    return uki.view.HorizontalSplitPane.prototype._drop.call(this, e);
  };

  page.attachTo( window, '1000 600' );

  var tree = uki('TreeList'),

    textField = uki('TextField'),

    search = function(event){
      var value = event.source.value();

      if(value==''){
        newData = data;
      }else{
        newData = jQuery.extend(true,{},{data:data}).data;
        newData = filter(newData,value);
      }

      uki('uki.more.view.TreeList').data(newData);
    }, 

    openIframe =  function(e){
      if(e.domEvent.which !== 13 && e.domEvent.which !== 1){
        return ;
      }

      var selected = this.listData()[this.selectedIndex()],
      path = selected.path +'/'+ selected.data;

      if(!selected.children){
        path = "/" + path.replace(/^\/?(\.\/)/,''); //clean
        uki('JSGIT')[0].load(path);
      }
    };

  textField
    .keypress(search)
    .keyup(search);
  
  textField.bind('keypress keydown keyup', function(e) { 
    tree.trigger(e.domEvent.type, e); 
  });

  uki('TreeList')
    .keypress(openIframe)
    .keydown(openIframe)
    .keyup(openIframe)
    .click(openIframe);

  jQuery.getJSON('/_tree',{repo: repo},function(newData){
    data = newData;
    uki('TreeList').data(newData);
  });
});

