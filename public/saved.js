$(document).ready(function(){
    $('.materialboxed').materialbox();
    $('.parallax').parallax();
    $('.button-collapse').sidenav();
    $('.sidenav').sidenav();
    window.onload = showSavedArticles;
    

    $(document).on("click", ".save", SaveArticle);
    
    function showSavedArticles() {
    $.getJSON("/api/saved-articles", function(data) {
      $(".post-preview").empty()
      if (data && data.length) {
      // For each one
      for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        var newsArticle = $("<div class='newsArticle'>").append("<a class = 'post-title titleFont' href=" + data[i].link + " data-id='" + data[i]._id + "'>" + data[i].title + "</a>")
        .append("<h6 class = 'post-subtitle subTitleFont'>" + data[i].body + "<a><i class='material-icons right save'>save</i></a></h6>")
        .append("<hr>")
        newsArticle.data("_id",data._id)
        $(".post-preview").append(newsArticle)
      }}
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
      <a href="/index" class="waves-effect waves-light btn grey darken-2"><i class="material-icons left">web</i>Browse Articles</a>
      </div>
      <br>
      </div>`
      $(".post-preview").append(emptyMessage)
    }
    
    function DeleteArticle() {
      // This function is triggered when the user wants to save an article
      // When we rendered the article initially, we attached a javascript object containing the headline id
      // to the element using the .data method. Here we retrieve that.
      var savedArticle = $(".post-title").data();
      console.log(savedArticle)
      $(this).parents(".newsArticle").remove();
      $(this).parents(".newsArticle").saved = true;
      $.ajax({
        method: "POST",
        url: "/api/save/" + savedArticle.id,
        data: savedArticle
      }).then(function(data) {
        if (data.saved) {
          initPage();
        }
      });
    }
    
    });