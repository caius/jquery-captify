/* jQuery Captify Plugin
 * 
 * Copyright (C) 2008 Brian Reavis
 * Licenced under the MIT license
 * 
 * $Date: 2008-12-12 [Fri, 12 Dec 2008] $
 */

jQuery.fn.extend({
	captify: function(o){
		var o = $.extend({
			speedOver: 'fast',		// speed of the mouseover effect
			speedOut: 'normal',		// speed of the mouseout effect
			hideDelay: 500,		  	// how long to delay the hiding of the caption after mouseout (ms)
			animation: 'fade',	  	// 'fade' or 'slide'
			prefix: '',			  	// text/html to be placed at the beginning of every caption
			className: 'caption'	// the name of the CSS class to apply to the caption box
		}, o);
		$(this).each(function(){
			var img = this;
			$(this).load(function(){
				$this = img;
				if (this.hasInit){
					return false;
				}
				this.hasInit = true;
				var over_caption = false;
				var over_img 	 = false;
				//pull the label from another element if there if there is a 
				//valid element id inside the rel="..." attribute, otherwise,
				//just use the text in the title="..." attribute.
				var captionLabelSrc = $('#' + $(this).attr('rel'));
				var captionLabelTitle = !captionLabelSrc.length ? $(this).attr('title') : captionLabelSrc.html();
				var captionLabelHTML = !captionLabelTitle.length ? $(this).attr('alt') : captionLabelTitle;
				captionLabelSrc.remove();
				var toWrap = this.parent && this.parent.tagName == 'a' ? this.parent : $(this);
				var wrapper = toWrap.wrap('<div></div>').parent();
				wrapper.css({
					overflow: 'hidden',
					padding: 0,
					fontSize: 0.1
				})
				wrapper.addClass('caption-wrapper');
				wrapper.width($(this).width());
				wrapper.height($(this).height());
				//transfer the border properties from the image to the wrapper
				$.map(['top','right','bottom','left'], function(i){
					$.map(['style','width','color'], function(j){
						var key = 'border-'+i+'-'+j;
						wrapper.css(key, $(img).css(key));
					});
				});
				$(img).css({border: '0 none'});
				//transfer the margin properties
				$.map(['top','right','bottom','left'], function(t){
					var key = 'margin-'+t;
					wrapper.css(key, $(img).css(key));
				});
				
				//create two consecutive divs, one for the semi-transparent background,
				//and other other for the fully-opaque label
				var caption 		= $('div:last', wrapper.append('<div></div>')).addClass(o.className);
				var captionContent 	= $('div:last', wrapper.append('<div></div>')).addClass(o.className).append(o.prefix).append(captionLabelHTML);
				
				//override hiding from CSS, and reset all margins (which could have been inherited)
				$('*',wrapper).css({margin: 0}).show();
				//ensure the background is on bottom
				var captionPositioning = jQuery.browser.msie ? 'static' : 'relative';
				caption.css({
					zIndex: 1,
					position: captionPositioning
				});
				
				//clear the backgrounds/borders from the label, and make it fully-opaque
				captionContent.css({
					position: captionPositioning,
					zIndex: 2,
					background: 'none',
					border: '0 none',
					opacity: 1.0
				});
				caption.width(captionContent.outerWidth());
				caption.height(captionContent.outerHeight());
				
				//pull the label up on top of the background
				captionContent.css({ 'marginTop': -caption.outerHeight() });
				//function to push the caption out of view
				var cHide = function(){
					if (!over_caption && !over_img)
						caption.animate({ marginTop: 0 }, o.speedOut); 
				};
				//when the mouse is over the image
				$(this).hover(
					function(){ 
						over_img = true;
						if (!over_caption) {
							caption.animate({
								marginTop: -caption.height()
							}, o.speedOver);
						}
					}, 
					function(){ 
						over_img = false;
						window.setTimeout(cHide, o.hideDelay);
					}
				);
				
				//when the mouse is over the caption on top of the image (the caption is a sibling of the image)
				$('div', wrapper).hover(
					function(){ over_caption = true; },
					function(){ over_caption = false; window.setTimeout(cHide, o.hideDelay); }
				);
			});
			//if the image has already loaded (due to being cached), force the load function to be called
			if (this.complete || this.naturalWidth > 0){
				$(img).trigger('load');
			}
		});
	}
});