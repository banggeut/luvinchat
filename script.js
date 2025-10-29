// script.js 최종 안전 버전 (Buzzk 데이터 구조에 완벽 대응)
document.addEventListener('DOMContentLoaded', () => {
    const chatMessagesContainer = document.getElementById('chatMessages');
    const emptyHeartIcon = document.querySelector('.bottom-right-icons .icon'); 
    const maxMessages = 5; 
    
    // 프로필 이미지 파일 목록
    const viewerProfileImages = [
        'default_profile.png', 'default_profile2.png', 
        'default_profile3.png', 'default_profile4.png' 
    ]; 

    // ★★★ 1. Buzzk 서버 웹 소켓 주소 (채널 ID 명시) ★★★
    // 사용자님의 실제 치지직 채널 ID를 명시적으로 넣었습니다.
    const YOUR_BACKEND_WEBSOCKET_URL = 'wss://buzzk.vercel.app/ws?id=0d7ac9ea88849fe93d8aae1c56586aaa'; 

    let socket;

    function connectWebSocket() {
        if (socket && socket.readyState === WebSocket.OPEN) return;

        socket = new WebSocket(YOUR_BACKEND_WEBSOCKET_URL);

        socket.onopen = (e) => {
            console.log("Buzzk 서버 연결 성공. 실시간 데이터 수신 시작.");
        };

        // ★★★ 2. 데이터 처리 로직 수정: Buzzk 데이터 구조 대응 ★★★
        socket.onmessage = (event) => {
            const dataString = typeof event.data === 'string' ? event.data : String(event.data);
            
            try {
                const data = JSON.parse(dataString);
                
                // Buzzk 라이브러리 문서의 'chat.onMessage' 콜백 구조를 따름
                if (data.type === 'chat' && data.payload) {
                    // payload 내부의 author, message 등을 직접 사용
                    handleNewChat(data.payload);
                } 
                // 시청자 수 업데이트 처리
                else if (data.type === 'viewer_count' && data.payload) {
                    const viewerCountElement = document.querySelector('.viewer-count');
                    if (viewerCountElement) {
                        viewerCountElement.innerHTML = `👁️ ${data.payload.count.toLocaleString()}`;
                    }
                }
            } catch (e) {
                console.error("데이터 파싱 오류 또는 예상치 못한 데이터:", e, dataString);
            }
        };
        // ... (연결 끊김 및 오류 시 재연결 로직은 이전과 동일하게 유지) ...

        socket.onclose = (e) => {
            console.warn("Buzzk 서버 연결 종료됨. 5초 후 재연결 시도.", e.reason);
            setTimeout(connectWebSocket, 5000); 
        };

        socket.onerror = (e) => {
            console.error("웹 소켓 오류 발생:", e);
            if (socket.readyState === WebSocket.OPEN) socket.close(); 
        };
    }

    connectWebSocket(); 

    // ----------------------------------------------------
    // handleNewChat 함수: Buzzk payload 구조에 맞춰 수정
    // ----------------------------------------------------
    function handleNewChat(chatPayload) {
        // chatPayload는 author, message 등을 포함
        const randomIndex = Math.floor(Math.random() * viewerProfileImages.length);
        const profileImgSrc = viewerProfileImages[randomIndex];
        
        const messageItem = document.createElement('div');
        messageItem.classList.add('chat-message-item');
        
        messageItem.innerHTML = `
            <img src="${profileImgSrc}" class="chat-profile-img" alt="Profile">
            <div class="chat-text-container">
                <span class="chat-username">${chatPayload.author.name}</span>
                <span class="chat-text">${chatPayload.message}</span>
            </div>
        `;
        
        chatMessagesContainer.append(messageItem); 
        createHeart(); 

        // 최대 개수 제한 로직
        if (chatMessagesContainer.children.length > maxMessages) {
            const oldestMessage = chatMessagesContainer.firstChild;
            oldestMessage.classList.add('fade-out');
            oldestMessage.addEventListener('animationend', () => {
                oldestMessage.remove();
            }, { once: true });
        }
        
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; 
    }

    // ----------------------------------------------------
    // createHeart 함수는 기존과 동일
    // ----------------------------------------------------
    function createHeart() {
        if (!emptyHeartIcon) return;

        const rect = emptyHeartIcon.getBoundingClientRect();
        
        const heartIcon = document.createElement('img');
        heartIcon.src = 'heart_red.png'; 
        heartIcon.classList.add('heart-icon');

        document.body.appendChild(heartIcon); 
        
        heartIcon.style.left = `${rect.left + rect.width / 2 - heartIcon.offsetWidth / 2}px`;
        heartIcon.style.bottom = `${window.innerHeight - rect.bottom}px`; 
        
        heartIcon.addEventListener('animationend', () => {
            heartIcon.remove();
        });
    }
});
