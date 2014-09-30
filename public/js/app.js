$(document).ready(function () {
  var lastId = $('#lastId').val();

  bindActions();
  //checkForNewMessages(lastId);
});

function bindActions(){
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
