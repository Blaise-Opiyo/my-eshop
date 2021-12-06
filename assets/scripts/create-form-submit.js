/*
$(document).ready(() =>{
    $('.createItem-form-container .createItem-form').submit((e) =>{
        e.preventDefault();
        console.log("form submitted");
        
        const form = $('.createItem-form-container .createItem-form');
        const formData = new FormData(form[0]);

        console.log(formData)
        $.ajax({
            type: "POST",
            url: "http://127.0.0.1:3001/create-form",
            enctype:"multipart/formdata",
            data: formData,
            contentType: false,
            processData: false,
            success: function(res){
                console.log('form submitted successfully');
                console.log(formData);
            },
            error: function(err){
                console.log("error: "+ err);
            }
        })

    })
});
*/