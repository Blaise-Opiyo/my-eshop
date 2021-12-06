$(document).ready(() =>{
    const sidenav = $('.side-nav');
    const sidenavOverlay = $('.sidenav-overlay');
    
    const showSidenav = () =>{

        const menu_bar = $('.menu-bar');
        menu_bar.click(()=>{
//            sidenav.css({"transform":"translateX(0)",
//                         });
            if($(window).width() <= 524){
                sidenav.css({"width":"50vw"});
            }else if($(window).width() > 524 && $(window).width() <= 880){
                sidenav.css({"width":"40vw"});
            }else{
                sidenav.css({"width":"30vw"});
            }
            
            sidenavOverlay.show();
        });
    }
       showSidenav();
    const hideSidenav = () =>{
        const cancelbtn = $('.side-nav .logo-box .cancel-btn');
        const sidenavWidth = sidenav.css('width');
        cancelbtn.click((e)=>{
            sidenav.css({"width":"0"});
            sidenavOverlay.hide();
        });
    }
    hideSidenav();
});

