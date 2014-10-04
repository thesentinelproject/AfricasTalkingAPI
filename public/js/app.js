$(document).ready(function () {
  var lastId = $('#lastId').val();
  var page = $('#page').val();

  bindActions(page, lastId);
});

function bindActions(page, lastId){
  if(page === 'index'){
    checkForNewMessages(lastId);
  }else if(page === 'send'){
  }else{}
}

function checkForNewMessages(lastId){
  var url = '/messages/check/'+lastId;  
  var fetch = false;

  $.get(url,function(data) {
    if(data){
      fetch = confirm("New messages found. Load them?");
      if (fetch) getData(lastId);
    }else{
      alert('No new messages');
    }
  });
}

function getData(lastId){
  var url = '/messages/fetch/'+lastId;  

  $.get(url,function(data) {
    if(data){
           
    }else{
    }
  });
}
