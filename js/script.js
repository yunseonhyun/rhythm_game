$(function () {
  // ===== 게임 변수 초기화 =====
  let score = 0; // 플레이어의 현재 점수
  let miss = 0; // 놓친 아이템 수
  let timeLeft = 60; // 남은 게임 시간 (1분 = 초)
  let gameActive = true; // 게임 진행 상태 확인
  let gameInterval; // 떨어지는 아이템 생성 후 id 값 설정
  let timerInterval; // 타이머 ID

  // 키보드와 키보드에 해당하는 번호 연결 설정
  const keyMap = {
    d: 0,
    f: 1,
    j: 2,
    k: 3,
  };

  /**
   * 게임 시작 함수
   * - 아이템 생성과 타이머를 시작한다.
   */
  function startGame() {
    // 새로운 아이템을 0.8초마다 생성해서 떨어뜨리기 (1000 = 1초, 800 = 0.8초)
    gameInterval = setInterval(아이템생성함수, 800);

    // 1000ms(1초) 마다 타이머 업데이트
    timerInterval = setInterval(타이머함수, 1000);
  }

  /**
   * 타이머 업데이트 함수
   * - 매초마다 실해되어 남은 시간을 감소시킨다.
   * - 시간이 0이 되면 게임을 종료한다.
   */

  function 타이머함수() {
    timeLeft--; // 남은 시간 1초 감소
    $("#timer").text(timeLeft); // 화면에 떠나고 남은 시간 표시

    // 시간이 60초가 다 되면 게임 종료
    if (timeLeft <= 0) {
      endGame();
    }
  }

  /**
   *  게임 종료 함수
   * - 모든 인터벌을 정리하고 최종 결과를 표시한다.
   */
  function endGame() {
    gameActive = false; // 게임 상대 비활성
    clearInterval(gameInterval); // 떨어지는 아이템 생성 중지
    clearInterval(timerInterval); // 60초 부터 떨어지는 시간 초 설정 중지

    // 최종 점수를 게임오버 모달에 표시
    $("#final-score").text(score);
    $("#final-miss").text(miss);
    $("#game-over").show(); // 게임이 종료됨을 보여줌
  }

  /**
   * 아이템 생성 함수
   * - 랜덤한 레인에 새로운 아이템을 생성하고 아래로 떨어뜨린다.
   * - 아이템생성함수 -> createItems로 함수명 변경하는 것이 좋음
   */
  function 아이템생성함수() {
    // 0 ~ 3 중 랜덤한 레인 선택
    const lane = Math.floor(Math.random() * 4);

    // 선택된 레인의 가로 너비 계산
    // 0 ~ 3 번 레인 중 .eq = 동일한 레인의 가로 너비 길이 가져오기
    const width = $(".lane").eq(lane).width();

    // 새로운 아이템 생성하고 떨어뜨리기
    const item = $("<div class='note'>")
      .css({
        left: lane * width + "px",
        width: width + "px",
      })
      .data("lane", lane); // 아이템이 속한 레인 번호 저장

    // 게임 컨테이너에 아이템 추가
    $("#game-container").append(item);

    // 아이템을 아래로 떨어뜨리는 애니메이션 (2초 동안)
    item.animate(
      { top: $("#game-container").height() + "px" },
      2000,
      "linear",
      function () {
        // 애니메이션 완료 시 (아이템이 높이 아래에 도탁했을 때)
        if (gameActive) {
          $(this).remove(); // 현재 item 제거
          miss++;
          $("#miss").text(miss); // 화면에 놓친 아이템 수 작성해서 사용자에게 알려주기
        }
      }
    );
  }

  /**
   * 아이템 적중 시 시각적으로 적중했다는 효과를 생성하는 함수
   * @param {number} laneIndex - 효과를 표시할 레인 번호(0 ~ 3) 매개변수
   */
  function 성공함수(laneIndex) {
    // 해당 레인의 위치 정보 가져오기
    const lane = $(".lane").eq(laneIndex);
    const laneOffset = lane.position();

    const effect = $("<div class='hit-effect'>").css({
        // 레인 중앙에 위치하도록 x좌표 계산(효과 크기의 절반만큼 보정)
      left: laneOffset.left + lane.width() / 2 - 30 + "px",
        // 판정선 위쪽에 위치하도록 y좌표 설정
      top: $("#game-container").height() - 120 + "px",
    });

    $("body").append(effect);

    setTimeout(() => effect.remove(), 400);
  }

  /**
   * 키보드 입력 처리 함수
   * - d, f, j, k 키 입력을 감지하여 아이템 판정을 수행한다.
   */
  $(document).keydown(function (e) {
    // 입력된 키를 소문자로 무조건 변환
    const key = e.key.toLowerCase();

    // 유효한 키가 아니라면 다른 키보드는 무시!
    // 객체에서 .hasOwnProperty(사용자가 작성한 키보드 입력값을)
    //          가지고 있나요?
    if (!keyMap.hasOwnProperty(key)) {
      // 가지고 있지 않는게 사실이라면 !
      return; // 아래 코드 수행하지 못하게 돌려보내기
    }

    // 입력된 키에 해당하는 레인 번호 가져오기
    const lane = keyMap[key];

    // 키보드가 누르는 판정선 위치를 계산 현재 위치는 하단에서 80px 위로 설정
    const judgeLine = $("#game-container").height() - 80;

    // 해당 레인의 모든 아이템을 검사해서 판정 수행
    $(".note").each(function () {
      // 현재 아이템이 입력된 키의 레인과 일치하는지 확인
      if ($(this).data("lane") === lane) {
        const notePos = $(this).position().top + 25;

        // 만약 아이템이 판정선 근처에 있는지 확인 (50px 오차 범위 사이)
        if (Math.abs(notePos - judgeLine) < 50) {
          $(this).stop().remove();
          score++;
          $("#score").text(score);

          // 성공 시각 효과 실행
          성공함수(lane);

          // 해당 키 버튼에 성공 효과 클래스 추가
          $(".key").eq(lane).addClass("perfect");
          setTimeout(() => $(".key").eq(lane).removeClass("perfect"), 300);
          // setTimeout을 이용해서 입력한 키보드 효과를 0.3초 후 누름 뗌 설정에 대해서
          // CSS 제공

          return false; //each 루트 중단(하나의 아이템만 처리)
        }
      }
    });
    // 성공 / 실패 관계없이 항상 키 눌림 설정에 대해서 css 적으로 보여주기
    $(".key").eq(lane).addClass("passed");
    setTimeout(() => $(".key").eq(lane).removeClass("passed"), 300);
  });

  startGame();
});
