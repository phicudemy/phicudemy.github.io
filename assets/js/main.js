var english = /^[A-Za-z0-9]*$/;
$(document).ready(function(){
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
  const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
  const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]')
  const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl))
    $('.persianDate').each(function () {
      var pDate = persianDate($(this).attr('data-timestamp'))
      $(this).text(pDate);
    });
    $('.persianMonth').each(function () {
      var pDate = persianMonth($(this).attr('data-timestamp'))
      $(this).text(pDate);
    });

    $('.content img').each(function () {
      $(this).after('<figcaption class="figure-caption">'+$(this).attr('alt')+'</figcaption>')
    })
    $('.content .footnote').each(function () {
      var noteClass, numClass = "";
      var href = $(this).attr('href').replace('#', '');
      var hrefContent = $(document.getElementById(href)).text().replace('↩', '');
      var hrefContentNoSpace = hrefContent.replace(/\s/g, '')
      if (english.test(hrefContentNoSpace.substring(0, 3))){
        noteClass = " p-english";
        numClass = '';
        $(document.getElementById(href)).addClass('p-english')
      } else {
        noteClass = "";
        numClass = ' font-fd'
        $(document.getElementById(href)).addClass('font-fd')
      }
      $(this).parent().wrap('<span class="sidenote-number'+numClass+'"></span>').after('<small class="sidenote'+noteClass+'">'+$(this).text()+': '+$(document.getElementById(href)).text().replace('↩', '')+'</small>');
    })

    $('button.content').on('click', function(e){
      $(this).addClass('active').parent().siblings().children().removeClass('active');
      if ($(this).val()){
        $('.content-card').hide();
        $('.'+$(this).val()).fadeIn('slow');
      } else {
        $('.content-card').fadeIn('slow');
      }
    })
    $('button.event').on('click', function(e){
      $(this).addClass('active').parent().siblings().children().removeClass('active');
      if ($(this).val()){
        $('.event-card').hide();
        $('.'+$(this).val()).fadeIn('slow');
      } else {
        $('.event-card').fadeIn('slow');
      }
    })
  
  
    })
    
    $.ajax({
      url:"/posts.json?v=0.6",
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
    function persianMonth(timestamp) {
      var stampDate = new Date(timestamp*1000);
      var faMonth = stampDate.toLocaleDateString('fa-IR', { month: 'long'});
      var faYear = stampDate.toLocaleDateString('fa-IR', { year: 'numeric' });
      var faDate = faMonth +' '+ faYear
      return faDate;
    }
    $(window).scroll(function () {
      if ($(this).scrollTop() < 400) {
        $('#navbar-content').hide();
      } else {
        $('#navbar-content').show();
      }
    });
    function copyToClipboard(text, el) {
      var copyTest = document.queryCommandSupported('copy');
      var elOriginalText = el.attr('data-bs-original-title');
    
      if (copyTest === true) {
        var copyTextArea = document.createElement("textarea");
        copyTextArea.value = text;
        document.body.appendChild(copyTextArea);
        copyTextArea.select();
        try {
          var successful = document.execCommand('copy');
          var msg = successful ? 'کپی شد.' : 'کپی نشد!';
          el.attr('data-bs-original-title', msg).tooltip('show');
        } catch (err) {
          console.log('Oops, unable to copy');
        }
        document.body.removeChild(copyTextArea);
        el.attr('data-bs-original-title', elOriginalText);
      } else {
        // Fallback if browser doesn't support .execCommand('copy')
        window.prompt("Copy to clipboard: Ctrl+C or Command+C, Enter", text);
      }
    }
    
    $(document).ready(function() {
      // Initialize
      // ---------------------------------------------------------------------
    
      // Tooltips
      // Requires Bootstrap 3 for functionality
      $('.js-tooltip').tooltip();
    
      // Copy to clipboard
      // Grab any text in the attribute 'data-copy' and pass it to the 
      // copy function
      $('.js-copy').click(function() {
        var text = $(this).attr('data-copy');
        var el = $(this);
        copyToClipboard(text, el);
      });
    });
  
    
    async function handleSubmit(event) {
        var form = document.getElementById("preregistrForm");

        $('.input').children().addClass('disabled')
        $('.submit-text').hide()
        $('.spinner-border').show()
        var status = document.getElementById("my-form-status");
        var data = new FormData(event.target);
        fetch(event.target.action, {
          method: form.method,
          body: data,
          headers: {
              'Accept': 'application/json'
          }
        }).then(response => {
          if (response.ok) {
            status.innerHTML = "پیش‌ثبت‌نام با موفقیت انجام شد.";
            $('.input').hide()
            form.reset()
          } else {
            response.json().then(data => {
              if (Object.hasOwn(data, 'errors')) {
                status.innerHTML = data["errors"].map(error => error["message"]).join(", ")
              } else {
                $('.input').children().removeClass('disabled')
                $('.spinner-border').hide()
                $('.submit-text').show()
                status.innerHTML = "مشکلی در انجام ثبت‌نام به وجود آمده است."
              }
            })
          }
        }).catch(error => {
          $('.input').children().removeClass('disabled')
          $('.spinner-border').hide()
          $('.submit-text').show()
          status.innerHTML = "مشکلی در انجام ثبت‌نام به وجود آمده است"
        });
      }
      $(document).on('submit', '#preregistrForm', function(event){
        event.preventDefault();
        handleSubmit(event)
    });
    function goToRegisterPage(eventUrl, eventTitle, eventPay1, eventPay2) {
      localStorage.setItem("event_url", eventUrl);
      localStorage.setItem("event_title", eventTitle);
      localStorage.setItem("event_pay1", eventPay1);
      localStorage.setItem("event_pay2", eventPay2);
      window.location.href = "/register/";
    }