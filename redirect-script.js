// Этот скрипт обрабатывает перенаправление с 404.html
(function() {
    // Проверяем, есть ли в URL параметр перенаправления
    var redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    
    if (redirect && redirect !== location.href) {
        history.replaceState(null, null, redirect);
    }
    
    // Специальная обработка для GitHub Pages
    var l = window.location;
    if (l.search.indexOf('?/') > -1) {
        var decoded = l.search.slice(1).split('&').map(function(s) { 
            return s.replace(/~and~/g, '&');
        }).join('?');
        
        window.history.replaceState(
            null, 
            null,
            l.pathname.slice(0, -1) + decoded + l.hash
        );
    }
})();