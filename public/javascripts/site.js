$('a[href="' + this.location.pathname + '"]').parents('li,ul').addClass('active');

$('#documentation').scrollspy({
    target: '.bs-docs-sidebar',
    offset: 40
});