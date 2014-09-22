$(document).ready(function () {
  var lastId = $('#last_id').val();

  getInitialData(lastId);
  window.refresh();
});

function getInitialData(lastId){
  // Get initial data
  var url = 'http://localhost:3000/messages/fetch/'+lastId;  

  $.get(url, function(data) {
    alert("Load was performed.");
  });
}
