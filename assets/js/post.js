$(".content a").each(function(){
    if ($(this).attr('href').startsWith('/courses/') || $(this).attr('href').startsWith('/posts/')){
      var $this = $(this)
      $.ajax({
      url:"/courses.json?v=0.5",
      dataType: 'json',
      async: false,
      success: function(data) {
        courses = data;
      }
    });
    $.ajax({
      url:"/posts.json?v=0.5",
      dataType: 'json',
      async: false,
      success: function(data) {
        posts = data;
      }
    });
    var course = courses.filter(function(el) {
      return el.link.includes($this.attr('href'))
    } );
    var post = posts.filter(function(el) {
      return el.link.includes($this.attr('href'))
    } );
    if (course.length > 0) {
      $this.addClass("link-underline-success link-offset-3").attr("data-bs-toggle","popover").attr("data-bs-title",course[0].title).attr("data-bs-content",'آکادمی/'+course[0].authors[0].title+': '+course[0].excerpt).attr( "data-bs-trigger","hover focus")
    } 
    if (post.length > 0) {
      $this.attr("data-bs-toggle","popover").attr("data-bs-title",post[0].title).attr("data-bs-content",'مجله/'+post[0].authors[0].title+': '+post[0].excerpt).attr( "data-bs-trigger","hover focus")
    }
    }
  })
document.addEventListener('DOMContentLoaded', function () {
    var scrollPosition = window.scrollY;
    var stickyBtn = document.querySelector('.side-card');
    window.addEventListener('scroll', function() {
        scrollPosition = window.scrollY;
        if (scrollPosition >= 300) {
          stickyBtn.classList.add('d-block');
          stickyBtn.classList.remove('d-none');
        } else {
          stickyBtn.classList.remove('d-block');
            stickyBtn.classList.add('d-none');
        }
    });

});