// script.js 최종 수정 버전 (시청자 수 및 하트 로직 수정)
document.addEventListener('DOMContentLoaded', () => {
    const chatMessagesContainer = document.getElementById('chatMessages');
    // 빈 하트 아이콘(♡) 요소를 직접 가져옵니다.
    const emptyHeartIcon = document.querySelector('.bottom-right-icons .icon'); 

    const maxMessages = 5; 
    
    // 시청자 프로필 이미지 목록 정의 (가지고 계신 파일명과 동일해야 합니다.)
    const viewerProfileImages = [
        'default_profile.png', 
        'default_profile2.png', 
        'default_profile3.png', 
        'default_profile4.png' 
    ]; 

    // ★★★ 1. Buzzk 서버 웹 소켓 주소 (Vercel 배포 주소 사용) ★★★
    const YOUR_BACKEND_WEBSOCKET_URL = 'wss://buzzk.vercel.app/ws'; 

    // 2. 웹 소켓 연결 설정
    const socket = new WebSocket(YOUR_BACKEND_WEBSOCKET_URL);

    socket.onopen = (e) => {
        console.log("Buzzk 서버 연결 성공. 실시간 데이터 수신 시작.");
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
            // 서버에서 'chat' 타입 데이터를 보낼 경우
            if (data.type === 'chat') {
                handleNewChat(data.payload);
            } 
            
            // 서버에서 'viewer_count' 타입 데이터를 보낼 경우
            else if (data.type === 'viewer_count') {
                const viewerCountElement = document.querySelector('.viewer-count');
                if (viewerCountElement) {
                    // ★★★ 수정된 로직: 👁️ 아이콘을 유지하고 숫자만 업데이트 ★★★
                    viewerCountElement.innerHTML = `👁️ ${data.payload.count.toLocaleString()}`;
                }
            }
        } catch (e) {
            console.error("데이터 파싱 오류:", e);
        }
    };

    // 3. 채팅 메시지 처리 함수 (handleNewChat)
    function handleNewChat(chatData) {
        // 랜덤 프로필 이미지 선택
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

    // 4. 하트 생성 로직 (createHeart)
    function createHeart() {
        if (!emptyHeartIcon) return; // 빈 하트 아이콘이 없으면 종료

        // 빈 하트 아이콘(♡)의 위치를 가져옵니다.
        const rect = emptyHeartIcon.getBoundingClientRect();
        
        const heartIcon = document.createElement('img');
        heartIcon.src = 'heart_red.png'; 
        heartIcon.classList.add('heart-icon');

        // ★★★ 심장 애니메이션 위치 오류 수정 (body에 추가) ★★★
        document.body.appendChild(heartIcon); 
        
        // 하트 아이콘의 초기 위치를 빈 하트 아이콘(♡)의 위치 중앙에 맞춥니다.
        heartIcon.style.left = `${rect.left + rect.width / 2 - heartIcon.offsetWidth / 2}px`;
        heartIcon.style.bottom = `${window.innerHeight - rect.bottom}px`; 
        
        heartIcon.addEventListener('animationend', () => {
            heartIcon.remove();
        });
    }

});