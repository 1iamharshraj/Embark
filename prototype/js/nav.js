(function(){
  var nav = document.getElementById('site-nav') || document.querySelector('.nav');
  if(!nav) return;
  var onScroll = function(){ nav.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();
  var burger = document.getElementById('nav-burger');
  var menu = document.getElementById('mob-menu');
  if(burger && menu){
    burger.addEventListener('click', function(){
      var open = !menu.classList.contains('open');
      menu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
  }
})();
