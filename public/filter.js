function filter(data,name){

  var result =[],
      element,
      filtration;
  
  for(var i =0; i<data.length; i++){
    element = data[i];

    if(element.children){

      element.children = filter(element.children,name);

      if(element.children.length > 0){
        result.push(element);
      }
    }else if(element.data && element.data.match(name)){
      result.push(element);
    }
  }

  return result;
}
