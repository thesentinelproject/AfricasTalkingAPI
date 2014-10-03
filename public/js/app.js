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
  var url = 'http://localhost:3000/messages/check/'+lastId;  

  $.get(url,function(data) {
    if(data){
      alert('Loading');
      getData(lastId);
    }else{
      alert('No new messages');
    }
  });
}

function getData(lastId){
  var url = 'http://localhost:3000/messages/fetch/'+lastId;  

  $.get(url,function(data) {
    if(data){
           
    }else{
    }
  });
}
