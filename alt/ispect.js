document.addEventListener('keydown', function() {
    if (event.keyCode == 123) {
      alert("0x1");
      return false;
    } else if (event.ctrlKey && event.shiftKey && event.keyCode == 73) {
      alert("0x1");
      return false;
    } else if (event.ctrlKey && event.keyCode == 85) {
      alert("0x1");
      return false;
    }
  }, false);
  
  if (document.addEventListener) {
    document.addEventListener('contextmenu', function(e) {
      alert("0x1");
      e.preventDefault();
    }, false);
  } else {
    document.attachEvent('oncontextmenu', function() {
      alert("0x1");
      window.event.returnValue = false;
    });
  }
