$(document).ready(function(){
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
  const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
    $('.persianDate').each(function () {
      var pDate = persianDate($(this).attr('data-timestamp'))
      $(this).text(pDate);
    });
    $('.content img').each(function () {
      $(this).after('<figcaption class="figure-caption">'+$(this).attr('alt')+'</figcaption>')
    })
    $('.content .footnote').each(function () {
      var href = $(this).attr('href').replace('#', '');
      var hrefContent = $(document.getElementById(href)).text().replace('↩', '');
      $(this).parent().wrap('<span class="sidenote-number"></span>').after('<small class="sidenote">'+$(this).text()+': '+$(document.getElementById(href)).text().replace('↩', '')+'</small>');
    })
    })
    
    $.ajax({
      url:"/posts.json?v=0.5",
      dataType: 'json',
      async: false,
      success: function(data) {
        posts = data;
      }
    });
    function persianDate(timestamp) {
      var stampDate = new Date(timestamp*1000);
      var faDate = stampDate.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
      return faDate;
    }
    