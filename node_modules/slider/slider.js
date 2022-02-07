!function (context) {
	// Responsive slider for ender
	// ===========================
	
	Slider = function(el, options){
		var obj = this
		
		// Default options
		obj.options = {
			auto : false,
			paginate : false
		}
		
		// Set custom options
		for (i in options) obj.options[i] = options[i]
		
		// Globals
		var slider = $(el).children(),
			wrapper = $('<div class="slider_wrap" />'),
			next = $('<input type="button" class="btn next" value="Next">'),
			prev = $('<input type="button" class="btn previous" value="Previous">'),
			pageLinks = [],
			dims = {},
			current = 1,
			direction = 'ltr', 
			autoTimer = null,
			animated = false
		
		// Count steps
		slider.steps = function(){ return slider.children().length }
		
		// Get elts dimensions
		slider.getDim = function(){
			var slide = slider.children()
			dims.slideW = slide.dim().width
			dims.slideH = slide.dim().height
			dims.wrapW = dims.slideW*(slider.steps())
			return dims
		}
		
		// Set elts dimensions
		slider.draw = function(){
			slider.getDim()
			wrapper.css({ width: dims.slideW })
			slider.css({ 
				left: '-'+dims.slideW*(current-1), 
				width: dims.wrapW, height: dims.slideH
			})
		}
		
		slider.paginate = function(){
			var pageC = $('<p class="pagination"></p>').appendTo($(el))
				
			for ( var i=0; i<slider.steps(); i++ ) {
				pageLinks[i] = $('<input type="button" class="slide" data-slide="'+(i+1)+'" value="'+(i+1)+'">')
				pageLinks[i].appendTo(pageC)
			}
			
			$(pageLinks).each(function(){
				var link = $(this)
				link.bind({
					click : function(){
						if ( !animated ) {
							slider.slideTo(parseFloat(link.attr('data-slide')))
							link.trigger('setActive')
						}
					},
					setActive : function(){
						$(pageLinks).each(function(){
							var that = this
							that.removeClass('slide_active')
						})
						link.addClass('slide_active')
					}
				})
			})
			
		}
		
		// Check current state and trigger elts binds depending on state
		slider.checkState = function(current){
			$([prev, next]).each(function(){ 
				that = $(this)
				that.trigger('enable') 
			})
			switch (current) {
				case 1 : prev.trigger('disable'); break;
				case slider.steps() : next.trigger('disable'); break;
			}
			if (!!obj.options.paginate) pageLinks[current-1].trigger('setActive')
		}
		
		// Slide to the requested occurence
  		slider.slideTo = function(slideEq){
  			var slideOffset = dims.slideW*(slideEq-1)
  			slider.checkState(slideEq)
  			if (!animated) {
  				animated = true	
				emile(slider[0], 'left:-'+slideOffset+'px', { 
					duration: 500,
					after : function(){
  						current = slideEq
  						animated = false
  					}
				})
				
  				current = slideEq
  				animated = false
  			}
  		}
		
		// Binds on prev/next buttons
		$([next, prev]).each(function(){
			var btn = $(this)
			btn.bind({
				disable : function(){ btn.addClass('btn_disabled') },
				enable : function(){ btn.removeClass('btn_disabled') }
			})
		})
		
		// Auto slide
		// -- Play autoplay
		slider.play = function(){
			autoTimer = setInterval(function(){
				switch(current){
					case 1 : direction = 'ltr'; break;
					case slider.steps() : direction = 'rtl'; break;
				}
				slider.slideTo( ( direction === 'rtl' ) ? current-1 : current+1 )
			}, obj.options.auto)
		}
		// -- Pause autoplay
		slider.pause = function(){
			clearInterval(autoTimer)
			autoTimer = null
		}
		// -- Stop autoplay
		slider.stop  = function(){
			slider.pause()
			$(el).unbind('mouseenter, mouseleave')
		}
		// -- Init autoplay
		slider.autoplay = function(){
			$(el).bind({
				mouseenter : function(){ slider.pause() },
				mouseleave : function(){ if (!autoTimer) slider.play() }
			})
			slider.play()
		}
		
		// Slider custom element initialization
		slider.init = function(){

			// -- Append layout & controls
			wrapper.insertBefore(slider)
			
			prev
				.insertBefore(slider)
				.unbind('click.prev')
				.bind('click.prev', function(){ if ( current != 1 ) slider.slideTo(current-1) })
				
			next
				.insertAfter(slider)
				.unbind('click.next')
				.bind('click.next', function(){ if ( current != slider.steps() ) slider.slideTo(current+1) })
				
			// If pagination 
			if (!!obj.options.paginate) slider.paginate()
			
			slider.checkState(current)
			
			slider.appendTo(wrapper).draw()
							
			// -- Redraw on resize
			$(window).resize(function(){ slider.draw() });
			
			// -- Autoslide
			if (!!obj.options.auto) slider.autoplay()
		}
		
		slider.init();
		
		// Public methods
		return {
			play : function(){ 
				slider.stop()
				slider.autoplay()
			},
			stop : function(){ slider.stop() },
			slideTo : function(eq){ slider.slideTo(eq) }
		}
	}
	
	if (typeof exports !== 'undefined') exports.Slider = Slider
	else window.Slider = Slider
	
}(this)