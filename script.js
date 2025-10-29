// script.js 최종 안전 버전 (Buzzk WS 주소 포함 및 오류 처리 강화)
document.addEventListener('DOMContentLoaded', () => {
    const chatMessagesContainer = document.getElementById('chatMessages');
    const emptyHeartIcon = document.querySelector('.bottom-right-icons .icon'); 

    const maxMessages = 5; 
    
    // 시청자 프로필 이미지 목록 정의 (가지고 계신 파일명과 동일해야 합니다.)
    const viewerProfileImages = [
        'default_profile.png', 
        'default_profile2.png', 
        'default_profile3.png', 
        'default_profile4.png' 
    ]; 

    // ★★★ 1. Buzzk 서버 웹 소켓 주소 (Vercel 도메인 사용) ★★★
    const YOUR_BACKEND_WEBSOCKET_URL = 'wss://buzzk.vercel.app/ws?id=0d7ac9ea88849fe93d8aae1c56586aaa';

    // 2. 웹 소켓 연결 설정
    let socket;

    function connectWebSocket() {
        if (socket && socket.readyState === WebSocket.OPEN) {
            return; // 이미 연결되어 있으면 다시 시도하지 않음
        }

        socket = new WebSocket(YOUR_BACKEND_WEBSOCKET_URL);

        socket.onopen = (e) => {
            console.log("Buzzk 서버 연결 성공. 실시간 데이터 수신 시작.");
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'chat') {
                    handleNewChat(data.payload);
                } 
                else if (data.type === 'viewer_count') {
                    const viewerCountElement = document.querySelector('.viewer-count');
                    if (viewerCountElement) {
                        // 👁️ 아이콘을 유지하고 숫자만 업데이트
                        viewerCountElement.innerHTML = `👁️ ${data.payload.count.toLocaleString()}`;
                    }
                }
            } catch (e) {
                console.error("데이터 파싱 오류:", e);
            }
        };

        // ★★★ 3. 오류 및 연결 종료 시 재연결 로직 추가 ★★★
        socket.onclose = (e) => {
            console.warn("Buzzk 서버 연결 종료됨. 잠시 후 재연결 시도.", e.reason);
            // 5초 후 재연결 시도
            setTimeout(connectWebSocket, 5000); 
        };

        socket.onerror = (e) => {
            console.error("웹 소켓 오류 발생:", e);
            socket.close(); // 오류 발생 시 닫고 재연결 로직으로 유도
        };
    }

    // 초기 연결 시도
    connectWebSocket(); 

    // 4. 채팅 메시지 처리 함수 (handleNewChat)
    function handleNewChat(chatData) {
        // ... (이전과 동일한 채팅 메시지 처리 및 애니메이션 로직) ...

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

        createHeart(); // 하트 생성 함수 호출

        // 최대 개수 초과 시, 맨 위 채팅 제거 로직 (유지)
        if (chatMessagesContainer.children.length > maxMessages) {
            const oldestMessage = chatMessagesContainer.firstChild;
            oldestMessage.classList.add('fade-out');
            oldestMessage.addEventListener('animationend', () => {
                oldestMessage.remove();
            }, { once: true });
        }
        
        chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight; 
    }

    // 5. 하트 생성 로직 (createHeart)
    function createHeart() {
        if (!emptyHeartIcon) return; // 빈 하트 아이콘이 없으면 종료

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

    // 참고: 현재 script.js 파일에는 샘플 채팅을 호출하는 setInterval이 정의되어 있습니다.
    // OBS에 최종 적용을 위해서는 GitHub에서 이 코드를 덮어써야 합니다.

});
