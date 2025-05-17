$.when(
  $.getJSON("/courses.json?v=0.61"),
  $.getJSON("/posts.json?v=0.71")
).done(function(coursesData, postsData) {
  var courses = coursesData[0];
  var posts = postsData[0];

  $(".content a").each(function() {
    var $this = $(this);
    var href = $this.attr('href');

    if (href.startsWith('/academy/') || href.startsWith('/magazine/')) {
      var course = courses.filter(function(el) {
        return el.link.includes(href);
      });

      var post = posts.filter(function(el) {
        return el.link.includes(href);
      });
      if (course.length > 0) {
        var others = course[0].authors.length >1 ? ' و...' : '';
        $this
          .addClass("link-underline-success link-offset-3")
          .attr("data-bs-toggle", "popover")
          .attr("data-bs-title", course[0].title)
          .attr("data-bs-content", 'آکادمی | ' + course[0].authors[0].title + others + ': ' + course[0].excerpt)
          .attr("data-bs-trigger", "hover focus");
      }

      if (post.length > 0) {
        var others = post[0].authors.length >1 ? ' و...' : '';
        $this
          .attr("data-bs-toggle", "popover")
          .attr("data-bs-title", post[0].title)
          .attr("data-bs-content", 'مجله | ' + post[0].authors[0].title + others + ': ' + post[0].excerpt)
          .attr("data-bs-trigger", "hover focus");
      }
    }
  });

  $('[data-bs-toggle="popover"]').popover();

}).fail(function(jqXHR, textStatus, errorThrown) {
  console.error("AJAX failed:", textStatus, errorThrown);
});


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