// script.js 최종 안전 버전 (채널 ID 명시, 재연결 및 오류 처리 강화)
document.addEventListener('DOMContentLoaded', () => {
    const chatMessagesContainer = document.getElementById('chatMessages');
    const emptyHeartIcon = document.querySelector('.bottom-right-icons .icon'); 
    const maxMessages = 5; 
    
    const viewerProfileImages = [
        'default_profile.png', 'default_profile2.png', 
        'default_profile3.png', 'default_profile4.png' 
    ]; 

    // ★★★ 1. Buzzk 서버 웹 소켓 주소 (채널 ID 명시) ★★★
    // 사용자님의 실제 치지직 채널 ID가 명시되었습니다.
    const YOUR_BACKEND_WEBSOCKET_URL = 'wss://buzzk.vercel.app/ws?id=0d7ac9ea88849fe93d8aae1c56586aaa'; 

    let socket;

    function connectWebSocket() {
        if (socket && socket.readyState === WebSocket.OPEN) {
            return;
        }

        socket = new WebSocket(YOUR_BACKEND_WEBSOCKET_URL);

        socket.onopen = (e) => {
            console.log("Buzzk 서버 연결 성공. 실시간 데이터 수신 시작.");
        };

        socket.onmessage = (event) => {
            // 수신된 데이터의 자료형이 문자열이 아닐 경우 문자열로 변환 시도
            const dataString = typeof event.data === 'string' ? event.data : String(event.data);
            
            try {
                const data = JSON.parse(dataString); // JSON 파싱 시도
                
                if (data.type === 'chat' && data.payload) {
                    handleNewChat(data.payload);
                } 
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

        socket.onclose = (e) => {
            console.warn("Buzzk 서버 연결 종료됨. 5초 후 재연결 시도.", e.reason);
            // 5초 후 재연결 시도
            setTimeout(connectWebSocket, 5000); 
        };

        socket.onerror = (e) => {
            console.error("웹 소켓 오류 발생:", e);
            // 오류 발생 시 연결을 닫고 재연결 로직으로 유도
            if (socket.readyState === WebSocket.OPEN) socket.close(); 
        };
    }

    connectWebSocket(); 

    // ----------------------------------------------------
    // handleNewChat 및 createHeart 함수는 기존과 동일
    // ----------------------------------------------------

    function handleNewChat(chatData) {
        const randomIndex = Math.floor(Math.random() * viewerProfileImages.length);
        const profileImgSrc = viewerProfileImages[randomIndex];
        
        const messageItem = document.createElement('div');
        messageItem.classList.add('chat-message-item');
        
        messageItem.innerHTML = `
            <img src="${profileImgSrc}" class="chat-profile-img" alt="Profile">
            <div class="chat-text-container">
                <span class="chat-username">${chatData.userName}</span>
                <span class="chat-text">${chatData.message}</span>
            </div>
        `;
        
        chatMessagesContainer.append(messageItem); 
        createHeart(); 

        if (chatMessagesContainer.children.length > maxMessages) {
            const oldestMessage = chatMessagesContainer.firstChild;
            oldestMessage.classList.add('fade-out');
            oldestMessage.addEventListener('animationend', () => {
                oldestMessage.remove();
            }, { once: true });
        }
        
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; 
    }

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
