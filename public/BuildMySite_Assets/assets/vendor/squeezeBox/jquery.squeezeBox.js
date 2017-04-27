/*
 * squeezeBox v1.0.1
 * By Rob Garrison (aka Mottie & Fudgey)
 * Dual licensed under the MIT and GPL licenses.
 *
 */
(function($){
	$.squeezeBox = function(el, options){

		var base = this;
		base.$el = $(el);
		base.el = el;

		// Add a reverse reference to the DOM object
		base.$el.data("squeezeBox", base);

		// invert selection
		$.fn.invert = function() {
			return this.end().not(this);
		};

		base.init = function(){
			base.options = $.extend({}, $.squeezeBox.defaultOptions, options);

			// objects
			base.doc = $(document);
			base.win = $(window);
			// Opera scrolling fix - http://www.zachstronaut.com/posts/2009/01/18/jquery-smooth-scroll-bugs.html
			var scrollElement = 'html, body';
			$('html, body').each(function(){
				var initScrollTop = $(this).attr('scrollTop');
				$(this).attr('scrollTop', initScrollTop + 1);
				if ($(this).attr('scrollTop') === initScrollTop + 1) {
					scrollElement = this.nodeName.toLowerCase();
					$(this).attr('scrollTop', initScrollTop);
					return false;
				}
			});
			base.page = $(scrollElement);
			base.headers = base.$el.children().filter(base.options.headers);
			base.allHeaders = base.$el.find(base.options.blockHeaders).add( base.headers );

			// defaults
			base.enabled = true;
			base.parentOffset = base.$el.offset().top;			
			base.prevTop = base.parentOffset;
			base.lastTop = 0;
			base.len = base.allHeaders.length;

			// accordion classes - UI or custom
			base.ui = (base.options.useUI) ? 'ui-' : 'sb-';
			base.wrapper = 'sb-overall-wrapper ' + base.ui + 'accordion ' + base.ui + 'widget ' + base.ui + 'helper-reset';
			base.wrapper += (base.options.enableIcons) ? ' ' + base.ui + 'accordion-icons' : '';
			base.accordion = base.ui + 'accordion-header ' + base.ui + 'helper-reset ' + base.ui + 'state-default ' + base.ui + 'corner-all';
			base.content = base.ui + 'accordion-content ' + base.ui + 'helper-reset ' + base.ui + 'widget-content ' + base.ui +
				'corner-bottom ' + base.ui + 'accordion-content-active';
			base.icon = (base.options.enableIcons) ? base.ui + 'icon' : '';
			base.hover = base.ui + 'state-hover';
			base.active = base.ui + 'state-active';

			base.$el
				.addClass(base.wrapper)
				.css('position', 'relative')
				// make sure headers are above content
				.find(base.options.blockHeaders).css({ zIndex: base.options.zIndex });

			// Setup non-block headers
			base.headers
				.hover(function(){
					$(this).addClass(base.hover);
				}, function(){
					$(this).removeClass(base.hover);
				})
				.find('a').click(function(){
					return false;
				});

			// Setup all headers
			base.allHeaders
				// make headers clickable
				.click(function(){

					var index = base.allHeaders.index($(this));

					if(!$(this).hasClass('sticky')){
						
						if(index < base.allHeaders.length-1){
							base.setHeader(index+1);
						}else if(index === base.allHeaders.length-1){
							base.setHeader(index-1);
						}
					}else{
						base.setHeader(index);	
					}
					
				})
				// Add header styling
				.each(function(){
					if (!$(this).is(base.options.blockHeaders)){
						$(this)
							.wrapInner('<a href="#"></a>')
							.addClass(base.accordion)
							.prepend('<span class="' + base.icon + ' ' + base.options.openIcon + '"></span>')
							.next().addClass(base.content);
					}
					$(this)
						.css({ height: $(this).height(), zIndex: base.options.zIndex })
						.wrap( $('<div />', { 'class' : 'sb-header-wrapper', height: $(this).outerHeight(), css : { margin: 0, padding: 0, border: 0 } }) );
				});

			base.win.resize(function(){ if (base.enabled){base.updateHeaders();} });
			base.win.scroll(function(){ if (base.enabled){base.updateHeaders();} });

			// If ID is in the hash, target that header... it doesn't always work
			if (window.location.hash) {
				setTimeout(function(){
					base.setHeader( window.location.hash );
				}, 600);
			}

		};

		// Set header
		base.setHeader = function(el){
			var tar, newScrollTop = 1;
			// convert hash/id to indexed number
			if (/^#/.test(el)) {
				tar = $(el);
				el = (tar.length) ? base.allHeaders.index(tar) : 0;
			}
			// add a few extra pixels to ensure the selected block shows as active
			base.allHeaders.each(function(i){
				if (i === el) {
					 newScrollTop += $(this).parent().offset().top;
				} else if ( i < el ) {
					 newScrollTop -= $(this).parent().outerHeight();
				}
			});
			base.enabled = false;
			base.page.animate({ scrollTop : newScrollTop }, {
				duration: base.options.animationTime,
				start: function(){
					if(typeof(pangaea.listView.setScrollAnimationFlag) !== undefined){
						pangaea.listView.setScrollAnimationFlag(true);
					}
				},
				done: function(){
					if(typeof(pangaea.listView.setScrollAnimationFlag) !== undefined){
						pangaea.listView.setScrollAnimationFlag(true);
					}
				}
			});
			base.enabled = true;
			base.updateHeaders();
		};

		// Get current header
		base.getHeader = function(){
			return base.allHeaders.filter('.' + base.active);
		};

		// Update header positions
		base.updateHeaders = function(){
			base.currentTop = base.doc.scrollTop() + base.prevTop;			
			base.width = base.$el.innerWidth();
			var i, fix, loc, ht, $this;
			for (i=0; i < base.len; i++) {
				$this = base.allHeaders.eq(i);
				fix = $this.is('.' + base.options.fixedClass);
				loc = $this.parent().offset().top;
				ht = $this.parent().outerHeight();				

				if ( !fix && base.currentTop >= loc ) {
					$this
						.addClass(base.options.fixedClass)
						.css({ top: base.prevTop, position: 'fixed' });

					if(i > 0){
						//Set the CSS to hide the table column headers on moving to fixed state.
						$this.css({top: (base.prevTop - (i*$this.find('.results-header').outerHeight())) });								
					}	


					base.prevTop += ht;
					base.nextStop = ( i + 1 < base.len ) ? base.allHeaders.eq(i+1).parent().offset().top : 0;
					base.options.onHeaderChangeCallback($this);
				} else if ( fix && base.currentTop <= loc + ht ) {
					$this
						.removeClass(base.options.fixedClass)
						.css({ top: 0, position: 'relative' });
					base.prevTop -= ht;

					if(base.prevTop < base.parentOffset && i==0){
						base.prevTop = base.parentOffset;
					}

					base.options.onHeaderChangeCallback($this);
				}
			}

			base.allHeaders
				.removeClass(base.active)
				.css('width', base.width)
				.filter('.' + base.options.fixedClass + ':last')
				.addClass(base.active);

			if (base.options.enableIcons) {
				base.headers
					.filter('.' + base.options.fixedClass + ':not(.' + base.options.fixedClass + ':last)').find('span')
					.removeClass(base.options.openIcon)
					.addClass(base.options.closedIcon)
					.end().invert().find('span')
					.removeClass(base.options.closedIcon)
					.addClass(base.options.openIcon);
			}

		};

		base.updatePrevTop = function(){
			var newValue = base.$el.offset().top;

			base.prevTop = newValue;


			for (var i=0; i < base.len; i++) {
				var $this = base.allHeaders.eq(i);
				if($this.is('.' + base.options.fixedClass)){
					$this.css({top: (parseInt($this.css('top').replace('px','')) - base.parentOffset + newValue)});
					base.prevTop += $this.parent().outerHeight();
				}				
			}	
			
			base.parentOffset = newValue;
		}

		base.init();
	};

	$.squeezeBox.defaultOptions = {
		blockHeaders  : 'div.header',           // Class name for non-collapsible headers
		headers       : 'h1, h2, h3',           // Collapsible headers
		fixedClass    : 'fixed',                // Class added when the header becomes fixed in place
		useUI         : true,                   // If true, class names match jQuery UI theme; see squeezeBox.css for full non-UI css.
		enableIcons   : true,                   // If true, accordion arrow images are added
		openIcon      : 'ui-icon-triangle-1-s', // open icon class name - matches jQuery UI icon, but works in non-ui css
		closedIcon    : 'ui-icon-triangle-1-e', // close icon class name - matches jQuery UI icon, but works in non-ui css
		animationTime : 300,                    // Time in milliseconds for scroll animation, only occurs when clicking on a header
		zIndex        : 100                     // z-index added to the headers, so they are above the content
	};

	$.fn.squeezeBox = function(options){
		return this.each(function(){
			(new $.squeezeBox(this, options));
		});
	};

	$.fn.getsqueezeBox = function(){
		this.data("squeezeBox");
	};

})(jQuery);
