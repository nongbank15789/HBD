$(document).ready(function() {
    var flame = $("#flame");
    var h1_text = $("h1");
    var postBlowMessage = $("#post-blow-message");
    var readLetterBtn = $("#read-letter-btn");
    var candlePage = $("#candle-page");
    var loveLetterPage = $("#love-letter-page");
    var backToCandleBtn = $("#back-to-candle-btn");
    var backgroundMusic = $("#background-music")[0];
    var blowSound = $("#blow-sound")[0];
    var micInstruction = $("#mic-instruction");
    var fireworksDisplay = $("#fireworks-display"); // อ้างอิงถึง div พลุ
    var fireworksText = $(".fireworks-text"); // อ้างอิงถึง text พลุ

    // --- Web Audio API สำหรับการตรวจจับเสียง ---
    let audioContext;
    let analyser;
    let microphone;
    let dataArray;
    let hasBlown = false;
    const BLOW_THRESHOLD = 125; // ปรับค่านี้ตามความเหมาะสม

    function startAudioDetection() {
        // ตรวจสอบว่าไมโครโฟนยังไม่ถูกใช้งาน
        if (microphone && audioContext && audioContext.state === 'running') {
            console.log("Microphone already active.");
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                microphone = audioContext.createMediaStreamSource(stream);
                analyser = audioContext.createAnalyser();
                microphone.connect(analyser);
                analyser.fftSize = 256;
                const bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);

                micInstruction.text("เป่าเทียนได้เลย!");
                micInstruction.css('color', 'lightgreen');

                detectBlow();
            })
            .catch(function(err) {
                console.error('Error accessing microphone: ', err);
                micInstruction.text("ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาอนุญาตและลองใหม่");
                micInstruction.css('color', 'red');
            });
    }

    function detectBlow() {
        if (hasBlown) {
            // หยุดการตรวจจับเมื่อเทียนดับแล้ว
            if (microphone) microphone.disconnect();
            if (audioContext && audioContext.state === 'running') audioContext.close();
            return;
        }

        if (analyser) { // ตรวจสอบว่า analyser ถูกสร้างแล้ว
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            let average = sum / dataArray.length;

            // console.log("Average volume:", average); // สำหรับดีบัก

            if (average > BLOW_THRESHOLD) {
                if (!hasBlown) {
                    handleCandleBlow();
                }
            } else {
                requestAnimationFrame(detectBlow);
            }
        } else {
             requestAnimationFrame(detectBlow); // ถ้า analyser ยังไม่พร้อม ให้ลองเรียกซ้ำ
        }
    }

    function handleCandleBlow() {
        hasBlown = true;
        flame.removeClass("burn").addClass("puff");
        $(".smoke").each(function () {
            $(this).addClass("puff-bubble");
        });
        $("#glow").remove();

        h1_text.hide();
        postBlowMessage.delay(750).fadeIn(300);
        readLetterBtn.delay(1000).fadeIn(300);

        $("#candle").animate(
            {
                opacity: ".5"
            },
            100
        );

        blowSound.currentTime = 0;
        blowSound.play();

        if (backgroundMusic && backgroundMusic.paused) {
            backgroundMusic.play().catch(error => {
                console.log("Failed to play background music:", error);
            });
        }
    }
    // --- สิ้นสุดส่วน Web Audio API ---

    // กำหนดข้อความ h1 เริ่มต้น
    h1_text.text("อธิษฐานแล้วเป่าเทียนเลยนะ!");

    // เริ่มต้นการขออนุญาตและตรวจจับไมโครโฟนเมื่อหน้าโหลด
    startAudioDetection();

    readLetterBtn.on('click', function() {
        candlePage.fadeOut(500, function() {
            loveLetterPage.fadeIn(500).css('display', 'flex');
        });
        if (backgroundMusic && backgroundMusic.paused) {
            backgroundMusic.play().catch(error => {
                console.log("Failed to play background music:", error);
            });
        }
    });

    backToCandleBtn.on('click', function() {
        loveLetterPage.fadeOut(500, function() {
            
            
            // --- ส่วนสำหรับแสดงพลุ "Happy Birthday" ---
            fireworksDisplay.css({ 'display': 'flex', 'opacity': 1, 'pointer-events': 'auto' }); // แสดง div พลุและทำให้คลิกได้
            // ต้องลบ animation class เก่าออกก่อนแล้วค่อยเพิ่มใหม่ เพื่อให้ animation เล่นซ้ำ
            fireworksText.css('animation', 'none'); 
            fireworksText[0].offsetHeight; // Trigger reflow
            fireworksText.css('animation', 'fireworksTextPop 1.5s forwards ease-out, fireworksTextGlow 2s infinite alternate'); // Re-add animation

            setTimeout(() => {
                fireworksDisplay.css('pointer-events', 'none'); // ปิด pointer-events ก่อน fadeOut
                 // ซ่อนพลุหลังจาก 1.5 วินาที
            }, 1000); // แสดงพลุ 1 วินาที ก่อนจะเริ่ม fadeOut

            // --- จบส่วนแสดงพลุ ---

           
        });
    });
});