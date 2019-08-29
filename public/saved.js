$(document).ready(function () {
  $('.materialboxed').materialbox();
  $('.parallax').parallax();
  $('.button-collapse').sidenav();
  $('.sidenav').sidenav();
  $('.modal').modal();
 
  window.onload = showSavedArticles;
  $(document).on("click", ".delete-note", deleteNote);
  $(document).on("click", ".delete", UnsaveArticle);

  function showSavedArticles() {
    $.getJSON("/api/saved-articles", function (data) {
      $(".post-preview").empty()
      if (data && data.length) {
        // For each one
        for (var i = 0; i < data.length; i++) {
          // Display the apropos information on the page
          var newsArticle = $("<div class='newsArticle'>").append("<a class = 'post-title titleFont' href=" + data[i].link + " data-id='" + data[i]._id + "'>" + data[i].title + "</a>")
            .append("<h6 class = 'post-subtitle subTitleFont' data-id='" + data[i]._id + "'>" + data[i].body + "<a><i class='material-icons right delete'>delete_forever</i></a><a><i class='material-icons right add-note' data-id='" + data[i]._id + "'>note_add</i></a></h6>")
            .append("<hr>")
          newsArticle.data("_id", data._id)
          $(".post-preview").append(newsArticle)
        }
      }
      else {
        showEmpty();
      }
    })
  }

  function showEmpty() {
    $(".post-preview").empty();
    var emptyMessage =
      `<div class="row no-articles">
      <div class="alert center-align teal">Uh oh - looks like there's no saved articles. Want to browse articles?</div>
      <br>
      <div class="center-align">
      <a href="/" class="waves-effect waves-light btn grey darken-2"><i class="material-icons left">web</i>Browse Articles</a>
      </div>
      <br>
      </div>`
    $(".post-preview").append(emptyMessage)
  }

  $(document).on("click", ".add-note", function() {
    $("#modal1").empty();
    $('#modal1').modal('open');
    var thisId = $(this).attr("data-id");
    console.log(thisId)
    $.ajax({
      method: "GET",
      url: "/api/articles/" + thisId
    })
      .then(function(data) {
        console.log(data);
        var modalText = `<div class="modal-content container">
         <div class="row">
                <form class="col s12">
                   <div class="row">
                   <h4>Notes For Article: ${data._id} </h4>
                  <hr>
                  <ul class='list-group note-container'></ul>
                     <div class="input-field col s12">
                       <i class="material-icons prefix">mode_edit</i>
                      <textarea id="icon_prefix2" class="materialize-textarea notes"></textarea>
                       <label for="icon_prefix2">New Note</label>
                       <hr>
                       <a class="modal-close waves-effect waves-light btn modal-trigger right save-note" data-id= ${data._id}>Save Note</a>
                     </div>
                   </div>
                 </form>
         </div>
         </div>`
        $("#modal1").append(modalText);
        if (data.note) {
        console.log("length is:",data.note.length)
        $(".note-container").append("<li class='list-group-item center-align'><h8>" + data.note.body + "</h8><a><i class='material-icons right delete-note' data-id='" + data.note._id + "'>clear</i></a></li>");
          console.log("=========================")
          console.log(data.note)
        } else {
          $(".note-container").append("<li class='list-group-item center-align'><h8>No notes for this article yet</h8></li>");
        }
      });
  });

  $(document).on("click", ".save-note", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        body: $(".notes").val().trim()
      }
    })
      .then(function(data) {
        console.log(data);
        $(".notes").empty();
      });
  });

  function deleteNote() {
    var noteToDelete = $(this).attr("data-id");
    $.get("/api/notes/" + noteToDelete).then(function() {
      $("#modal1").modal('close');
    });
  }

  function UnsaveArticle() {
    var savedArticle = $(".post-title").data();
    console.log(savedArticle)
    $(this).parents(".newsArticle").remove();
    $(this).parents(".newsArticle").saved = false;
    $.ajax({
      method: "POST",
      url: "/api/unsave/" + savedArticle.id,
      data: savedArticle
    }).then(function(data) {
      if (!data.saved) {
        showSavedArticles();
      }
    });
  }

  
});