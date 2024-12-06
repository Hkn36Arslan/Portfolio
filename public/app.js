
$(document).ready(function () {

    // Sayfa Yüklenince Tema Yükle
    const savedTheme = localStorage.getItem("theme") || "light";
    $("html").attr("data-theme", savedTheme);

    // İkonu Güncelleme
    $("#theme")
        .removeClass("fas fa-sun fa-moon")
        .addClass(savedTheme === "dark" ? "fas fa-sun" : "fas fa-moon");

    // Tema Geçiş Fonksiyonu
    $("#theme-icons").on("click", function () {
        const currentTheme = $("html").attr("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        $("html").attr("data-theme", newTheme);

        localStorage.setItem("theme", newTheme);

        // İkonu Güncelleme
        $("#theme")
            .removeClass("fas fa-sun fa-moon")
            .addClass(newTheme === "dark" ? "fas fa-sun" : "fas fa-moon");
    });


    /**************************************************************************************** */
    // Toggler yapısı açılır kapanır menu
    $('#openbtn').on("click", function () {
        $('#mySidebar').css("width", "180px");
    });

    $('#closebtn').on("click", function () {
        $('#mySidebar').css("width", "0px");
    });

    // Ekran boyutu değiştiğinde (resize olduğunda) kontrol et
    $(window).resize(function () {
        if ($(window).width() > 768) {
            $('#openbtn').css("display", "none");
        } else {
            $('#openbtn').css("display", "block");
        }
    });


    //Aktif link 
    $('.nav-link').on('click', function () {
        $('.nav-link').removeClass('active');
        $(this).addClass('active');
    });


    // Sunucudan alınacak JSON dosyasından verileri yükle
    $.ajax({
        url: '/get-data',
        dataType: 'json',
        success: function (data) {
            // Yetenekler
            data.skills.forEach(function (skill) {
                const progressBar = `
        <div class="col-6 skill">
            <div class="skill-title">${skill.name}</div>
            <div class="progress">
                <div class="progress-bar" role="progressbar" style="width: ${skill.progress}%; background-color: ${skill.color};" aria-valuenow="${skill.progress}" aria-valuemin="0" aria-valuemax="100">
                    ${skill.progress}%
                </div>
            </div>
        </div>
    `;
                $('#skills .row').append(progressBar);
            });

            // Projeler
            data.projects.forEach(function (project, index) {
                const projectCard = `
        <div class="project-card" data-index="${index}" style="display: none;">
            <img src="${project.image}" class="carousel-image" alt="${project.title}" />
            <div class="cardProject">
                <div class="card-body">
                    <h3>${project.title}</h3>
                    <span>${project.description}</span>
                    <a href="${project.link}" class="btn" target="_blank">View Project</a>
                </div>
            </div>
        </div>
    `;
                $('#projects-container').append(projectCard);
            });

            let currentIndex = 0;
            const projectCards = $('.project-card');
            const totalProjects = projectCards.length;

            function showProject(index) {
                projectCards.hide(); // Tüm kartları gizle
                $(projectCards[index]).show(); // Sadece belirtilen kartı göster
            }

            // İlk projeyi göster
            showProject(currentIndex);

            // Dinamik yön butonlarını oluştur
            const prevButton = $('<button id="prev-button"><i class="fas fa-arrow-left"></i></button>');
            const nextButton = $('<button id="next-button"><i class="fas fa-arrow-right"></i></button>');
            $('#projects-container').append(prevButton).append(nextButton);

            // Önceki butonuna tıklandığında
            prevButton.on('click', function () {
                currentIndex = (currentIndex - 1 + totalProjects) % totalProjects; // Önceki projeye git
                showProject(currentIndex);
            });

            // Sonraki butonuna tıklandığında
            nextButton.on('click', function () {
                currentIndex = (currentIndex + 1) % totalProjects; // Sonraki projeye git
                showProject(currentIndex);
            });

            // Otomatik geçiş için setInterval
            setInterval(function () {
                currentIndex = (currentIndex + 1) % totalProjects; // Sonraki projeye git
                showProject(currentIndex);
            }, 5000); // 5000 ms (5 saniye)

            // Referanslar
            data.testimonials.forEach(function (testimonial) {
                const testimonialCard = `
        <div class="col-6 testimonial">
            <div class="card">
                <blockquote class="blockquote">
                    <p class="mb-0">"${testimonial.message}"</p>
                    <footer class="blockquote-footer">${testimonial.client}</footer>
                </blockquote>
            </div>
        </div>
    `;
                $('#testimonials .row').append(testimonialCard);
            });

            $('.progress-bar').each(function () {
                const $this = $(this);
                const width = $this.attr('aria-valuenow');
                $this.css({ width: '0%' }).animate({ width: width + '%' }, 1000);
            });
        },
        error: function () {
            showAlert('Veri yüklenirken bir hata oluştu.', 'danger');
        }
    });

    /* ************************************************************************************************** */

    $('#contact-form').on("submit", function (e) {
        e.preventDefault(); // Formun otomatik gönderimini engelle

        // Form doğrulama
        const name = $('#name').val().trim();
        const email = $('#email').val().trim();
        const message = $('#message').val().trim();
        const file = $('#file')[0].files[0];

        if (!name || !email || !message || !file) {
            showAlert('Lütfen tüm alanları doldurunuz!', 'danger');
            return; // Eğer bir alan boşsa gönderim yapılmaz
        }

        // FormData oluşturma ve alanları ekleme
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('message', message);
        formData.append('file', file);

        // AJAX isteği ile formu gönderme
        $.ajax({
            url: '/contact',
            type: 'POST',
            data: formData,
            processData: false, // FormData kullanırken false olmalı
            contentType: false, // İçerik tipi çok parçalı form-data olarak ayarlanır
            success: function (response) {
                showAlert('Your message submitted successfully', 'success');
            },
            error: function () {
                showAlert('An error occurred while loading data', 'danger');
            }
        });
    });

    /***************************** **************************************************/
    // ChatBot Alanı
    $("#openChatbot").on("click", function () {
        $("#chatbot").css("display", "flex");
    });

    $("#closeChatbot").on("click", function () {
        $("#chatbot").css("display", "none");
    });

    $('#chatbotForm').on('submit', function (e) {
        e.preventDefault();
        const message = $('#chatbotInput').val();

        if (!message) {
            showAlert("Please fill in all required fields!", "danger");
            return;
        }
        addMessageToChat("user", message);

        $.ajax({
            url: '/chatBot',
            type: 'POST',
            data: JSON.stringify({ message: message }),
            contentType: 'application/json',
            success: function (response) {
                setTimeout(function () {
                    addMessageToChat("bot", response);
                }, 2000);
            },
            error: function (xhr) {
                showAlert(xhr.responseText, 'danger');
            }
        });

        $('#chatbotInput').val('');
    });

    // Mesajları chat alanına ekleyen fonksiyon
    function addMessageToChat(sender, message) {
        const imgBot = "/assets/images/chatBot.png";
        const imgUser = "/assets/images/image1.jpeg";
        const messageClass = sender === "user" ? "user-message" : "bot-message";
        const img = sender === "user" ? imgUser : imgBot;
        const messageElement = `<div class="${messageClass}">
        <img style="width:40px;height:40px; border-radius:100%;" src="${img}"/>
        ${message}
        </div>`;
        $('#chatbotMessages').append(messageElement);
        $('#chatbotMessages').scrollTop($('#chatbotMessages')[0].scrollHeight);
    }

    /* ********************************************************************************** */
    // Uyarı mesajı fonksiyonu
    function showAlert(message, type) {
        const alertMessage = $('#alert-message');
        const alertText = $('#alert-text');
        alertText.text(message);
        alertMessage.removeClass('alert-success alert-danger').addClass('alert-' + type);
        alertMessage.show().addClass('show');
        setTimeout(function () {
            alertMessage.removeClass('show').fadeOut();
        }, 5000);
    }
});
