import React, { useState, useEffect } from "react";
import { sentencePairs, SentencePair } from "../data/sentences";
import { useSpeech } from "../contexts/SpeechContext";
import { useKeyboardSound } from "../contexts/KeyboardSoundContext";
import { SpeechSettings } from "../components";
import { useFloatingMode } from "../hooks/useFloatingMode";

const SentencePractice: React.FC = () => {
  // 使用语音服务
  const { speakEnglish, isPlaying, settings: speechSettings } = useSpeech();
  // 使用键盘声音服务
  const { playKeySound } = useKeyboardSound();
  // 检测是否为小飘窗模式
  const isFloating = useFloatingMode();

  const [currentSentence, setCurrentSentence] = useState<SentencePair | null>(
    null
  );
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [usedSentences, setUsedSentences] = useState<number[]>([]);
  const [wordInputs, setWordInputs] = useState<string[]>([]);
  const [wordResults, setWordResults] = useState<(boolean | null)[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 解析句子，分离单词和标点符号
  const parseWordsAndPunctuation = (sentence: string) => {
    const tokens = sentence.split(" ");
    return tokens.map((token) => {
      // 使用正则表达式分离单词和标点符号
      const match = token.match(/^([a-zA-Z']+)([,;:!?.]*)$/);
      if (match) {
        return {
          word: match[1],
          punctuation: match[2],
        };
      } else {
        // 如果没有标点符号，整个token就是单词
        return {
          word: token,
          punctuation: "",
        };
      }
    });
  };

  useEffect(() => {
    loadNextSentence();
  }, []);
  useEffect(() => {
    if (currentSentence) {
      const parsedTokens = parseWordsAndPunctuation(currentSentence.english);
      setWordInputs(Array(parsedTokens.length).fill(""));
      setWordResults(Array(parsedTokens.length).fill(null));

      // 自动聚焦到第一个输入框
      setTimeout(() => {
        const firstInput = document.querySelector(
          'input[data-word-index="0"]'
        ) as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
    }
    // eslint-disable-next-line
  }, [currentSentence]);
  // 全局键盘监听  // 全局键盘监听
  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      // Enter键 - 下一句
      if (e.key === "Enter" && (isCorrect === true || showAnswer)) {
        e.preventDefault();
        nextSentence();
      }

      // Ctrl + ' - 播放英文发音
      if (e.ctrlKey && e.key === "'") {
        e.preventDefault();
        handleSpeakEnglish();
      }

      // Ctrl + M - 检查答案
      if (e.ctrlKey && e.key === "m" && isCorrect !== true && !showAnswer) {
        e.preventDefault();
        if (!wordInputs.some((input) => !input.trim())) {
          checkAnswer();
        }
      }

      // Ctrl + N - 显示答案
      if (e.ctrlKey && e.key === "n" && isCorrect !== true && !showAnswer) {
        e.preventDefault();
        showCorrectAnswer();
      }

      // Ctrl + R - 重置练习
      if (e.ctrlKey && e.key === "r") {
        e.preventDefault();
        resetGame();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyPress);

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyPress);
    };
  }, [isCorrect, showAnswer, wordInputs]);
  // 处理播放英文的函数
  const handleSpeakEnglish = () => {
    if (currentSentence) {
      speakEnglish(currentSentence.english);
    }
  };

  const loadNextSentence = () => {
    const availableSentences = sentencePairs.filter(
      (sentence) => !usedSentences.includes(sentence.id)
    );

    let nextSentence: SentencePair;
    if (availableSentences.length === 0) {
      // 所有句子都练习完了，重置
      setUsedSentences([]);
      nextSentence = sentencePairs[0];
      setCurrentSentence(nextSentence);
    } else {
      const randomIndex = Math.floor(Math.random() * availableSentences.length);
      nextSentence = availableSentences[randomIndex];
      setCurrentSentence(nextSentence);
      setUsedSentences((prev) => [...prev, nextSentence.id]);
    }
    setFeedback("");
    setIsCorrect(null);
    setShowAnswer(false); // 自动播放英文（延迟一点时间让UI更新完成）
    if (speechSettings.autoPlay && nextSentence) {
      setTimeout(() => {
        speakEnglish(nextSentence.english);
      }, 300);
    }

    // 自动聚焦到第一个输入框
    setTimeout(() => {
      const firstInput = document.querySelector(
        'input[data-word-index="0"]'
      ) as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  };
  const handleWordInput = (idx: number, value: string) => {
    // 播放键盘声音（只在输入新字符时播放）
    const oldValue = wordInputs[idx] || "";
    if (value.length > oldValue.length) {
      playKeySound("normal");
    }

    setWordInputs((inputs) => {
      const newInputs = [...inputs];
      newInputs[idx] = value;
      return newInputs;
    });
  };
  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>,
    idx: number
  ) => {
    if (e.key === " ") {
      e.preventDefault();
      playKeySound("space");
      checkSingleWord(idx);
    } else if (e.key === "Enter") {
      e.preventDefault();
      playKeySound("enter");
      // 只在未完成时检查答案，完成后由全局监听处理
      if (isCorrect !== true && !showAnswer) {
        checkAnswer();
      }
    }
  };
  const checkSingleWord = (idx: number) => {
    if (!currentSentence) return;

    const parsedTokens = parseWordsAndPunctuation(currentSentence.english);
    const userWord = wordInputs[idx]?.trim().toLowerCase();
    const correctWord = parsedTokens[idx]?.word.toLowerCase();

    const isCorrect = userWord === correctWord;

    setWordResults((prev) => {
      const newResults = [...prev];
      newResults[idx] = isCorrect;
      return newResults;
    });

    if (isCorrect && idx < parsedTokens.length - 1) {
      // 如果正确且不是最后一个单词，跳转到下一个输入框
      const nextInput = document.querySelector(
        `input[data-word-index="${idx + 1}"]`
      ) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  };
  const checkAnswer = () => {
    if (!currentSentence) return;
    const parsedTokens = parseWordsAndPunctuation(currentSentence.english);
    let allCorrect = true;
    const results = wordInputs.map((input, idx) => {
      const isWordCorrect =
        input.trim().toLowerCase() === parsedTokens[idx]?.word.toLowerCase();
      if (!isWordCorrect) allCorrect = false;
      return isWordCorrect;
    });
    setWordResults(results);
    setAttempts((prev) => prev + 1);
    if (allCorrect) {
      setIsCorrect(true);
      setFeedback("全部单词正确！🎉");
      setScore((prev) => prev + 1);
    } else {
      setIsCorrect(false);
      setFeedback("有单词不正确，请检查红色单词");
    }
  };
  const showCorrectAnswer = () => {
    setShowAnswer(true);
    setFeedback(`正确答案：${currentSentence?.english}`);
    if (currentSentence) {
      const parsedTokens = parseWordsAndPunctuation(currentSentence.english);
      const correctWords = parsedTokens.map((token) => token.word);
      setWordInputs(correctWords);
      setWordResults(Array(correctWords.length).fill(true));
    }
  };

  const nextSentence = () => {
    loadNextSentence();
  };
  const resetGame = () => {
    setScore(0);
    setAttempts(0);
    setUsedSentences([]);
    loadNextSentence();
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "简单";
      case "medium":
        return "中等";
      case "hard":
        return "困难";
      default:
        return "未知";
    }
  };
  // 只在本页面监听 Ctrl+Shift+P 切换窗口化和 Esc 退出窗口化
  useEffect(() => {
    const handleFloatingHotkey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "P" || e.key === "p")) {
        e.preventDefault();
        if (window.electronAPI?.toggleFloatingMode) {
          window.electronAPI.toggleFloatingMode();
        }
      }
      // Esc 键退出窗口化模式
      if (e.key === "Escape" && isFloating) {
        e.preventDefault();
        if (window.electronAPI?.toggleFloatingMode) {
          window.electronAPI.toggleFloatingMode();
        }
      }
    };
    document.addEventListener("keydown", handleFloatingHotkey);
    return () => {
      document.removeEventListener("keydown", handleFloatingHotkey);
    };
  }, [isFloating]);

  if (!currentSentence) {
    return <div className="text-center">加载中...</div>;
  }
  const accuracy = attempts > 0 ? Math.round((score / attempts) * 100) : 0;
  return (
    <div
      className={`relative h-full flex flex-col ${
        isFloating ? "floating-mode-content" : "bg-gray-50"
      }`}
    >
      {/* 小窗模式下的拖动区域 */}
      {isFloating && (
        <div className="absolute inset-0 drag-region" style={{ zIndex: 0 }} />
      )}
      {/* 主要内容区域 */}
      <div className="flex-1 overflow-y-auto flex items-center relative z-10">
        {" "}
        <div
          className={`w-full ${isFloating ? "px-2 py-3" : "px-6 py-8"} ${
            isFloating ? "drag-region" : ""
          }`}
        >
          {/* 简约的统计信息 - 飘窗模式下隐藏 */}
          {!isFloating && (
            <div
              className={`flex items-center justify-center gap-8 ${
                isFloating ? "mb-4" : "mb-8"
              }`}
            >
              <div className="text-center">
                <div
                  className={`${
                    isFloating ? "text-base" : "text-lg"
                  } font-semibold text-gray-900`}
                >
                  {score}/{attempts}
                </div>
                <div
                  className={`${
                    isFloating ? "text-xs" : "text-sm"
                  } text-gray-500`}
                >
                  得分
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`${
                    isFloating ? "text-base" : "text-lg"
                  } font-semibold text-blue-600`}
                >
                  {accuracy}%
                </div>
                <div
                  className={`${
                    isFloating ? "text-xs" : "text-sm"
                  } text-gray-500`}
                >
                  准确率
                </div>
              </div>
            </div>
          )}            
          {/* 主要练习区域 */}
          <div
            className={`mx-auto w-full ${
              isFloating ? "max-w-full drag-region" : "max-w-full"
            }`}
          >
            {" "}
            {/* 中文句子 */}
            <div
              className={`text-center ${isFloating ? "mb-4" : "mb-8"} ${
                isFloating ? "drag-region" : ""
              }`}
            >
              <div
                className={`flex items-center justify-center gap-3 ${
                  isFloating ? "mb-1" : "mb-2"
                } ${isFloating ? "drag-region" : ""}`}
              >
                {" "}
                <p
                  className={`${
                    isFloating ? "text-base" : "text-xl"
                  } text-gray-900 ${
                    isFloating ? "floating-mode-text drag-region" : ""
                  }`}
                >
                  {currentSentence.chinese}
                </p>
                <button
                  onClick={handleSpeakEnglish}
                  disabled={isPlaying}
                  className={`${
                    isFloating ? "p-1" : "p-2"
                  } text-gray-400 hover:text-blue-600 rounded-lg transition-colors disabled:opacity-50 no-drag`}
                  title="播放英文发音"
                >
                  <svg
                    className={`${isFloating ? "w-4 h-4" : "w-5 h-5"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776L4.36 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.36l4.023-3.776zM15.657 6.343a1 1 0 011.414 0A8.971 8.971 0 0119 12a8.971 8.971 0 01-1.929 5.657 1 1 0 11-1.414-1.414A6.971 6.971 0 0017 12a6.971 6.971 0 00-1.343-4.243 1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M13.243 8.757a1 1 0 011.414 0A4.978 4.978 0 0116 12a4.978 4.978 0 01-1.343 3.243 1 1 0 11-1.414-1.414A2.978 2.978 0 0014 12a2.978 2.978 0 00-.757-1.757 1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>{" "}
              <div
                className={`text-xs text-gray-400 ${
                  isFloating ? "drag-region" : ""
                }`}
              >
                {getDifficultyText(currentSentence.difficulty)}
              </div>
            </div>{" "}
            {/* 输入框区域 */}
            <div className={`mb-8 ${isFloating ? "drag-region" : ""}`}>
              <div
                className={`flex flex-wrap gap-2 justify-center items-baseline w-full ${
                  isFloating ? "drag-region" : ""
                }`}
              >
                {parseWordsAndPunctuation(currentSentence.english).map(
                  (token, idx) => (
                    <div key={idx} className="flex items-baseline">
                      {" "}
                      <input
                        type="text"
                        value={wordInputs[idx] || ""}
                        onChange={(e) => handleWordInput(idx, e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, idx)}
                        data-word-index={idx}
                        className={`px-2 py-1 text-center ${
                          isFloating ? "text-lg" : "text-2xl"
                        } font-bold bg-transparent border-0 border-b-2 focus:outline-none transition-colors no-drag ${
                          isFloating ? "floating-mode-text" : ""
                        }
                        ${
                          wordResults[idx] === false
                            ? "border-b-red-400 text-red-700"
                            : wordResults[idx] === true
                            ? "border-b-green-400 text-green-700"
                            : "border-b-gray-300 focus:border-b-blue-500 text-gray-800"
                        }`}
                        style={{
                          width: `${Math.max(
                            token.word.length * (isFloating ? 16 : 24),
                            isFloating ? 80 : 120
                          )}px`,
                          fontFamily:
                            '"Microsoft YaHei", "微软雅黑", sans-serif',
                        }}
                        disabled={isCorrect === true || showAnswer}
                        placeholder={showAnswer ? token.word : ""}
                      />{" "}
                      {token.punctuation && (
                        <span
                          className={`${
                            isFloating ? "text-xl" : "text-3xl"
                          } text-gray-700 ml-1 font-bold`}
                          style={{
                            fontFamily:
                              '"Microsoft YaHei", "微软雅黑", sans-serif',
                          }}
                        >
                          {token.punctuation}
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>{" "}
            {/* 反馈信息 */}
            {feedback && (
              <div
                className={`text-center mb-6 ${
                  isFloating ? "drag-region" : ""
                }`}
              >
                <p
                  className={`text-sm ${
                    isCorrect === true
                      ? "text-green-600"
                      : isCorrect === false
                      ? "text-red-600"
                      : "text-blue-600"
                  } ${isFloating ? "drag-region" : ""}`}
                >
                  {feedback}
                </p>
              </div>
            )}
          </div>
          {/* 设置浮窗 */}
          {isDrawerOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-drag">
              <div className="w-96 bg-white rounded-lg shadow-lg max-h-[80vh] overflow-hidden no-drag">
                <div className="p-6 h-full overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-gray-900">
                      语音设置
                    </h2>{" "}
                    <button
                      onClick={() => setIsDrawerOpen(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded no-drag"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <SpeechSettings />
                </div>
              </div>
            </div>
          )}{" "}
        </div>
      </div>{" "}
      {/* 进度条区域 - 小飘窗模式下隐藏 */}
      {!isFloating && (
        <div className="w-full bg-gray-50 px-6 py-3">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">
              {usedSentences.length} / {sentencePairs.length}
            </div>
            <div className="w-full max-w-2xl h-2 bg-gray-200 rounded-full mx-auto">
              <div
                className="h-2 bg-gray-400 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (usedSentences.length / sentencePairs.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      )}{" "}
      {/* 简约的底部操作栏 - 小飘窗模式下隐藏 */}
      {!isFloating && (
        <div className="flex w-full bg-white border-t border-gray-200 px-6 py-4">
          <div className="w-full flex items-center justify-between">
            {/* 左侧和中间的按钮 */}
            <div className="flex items-center justify-center gap-3 flex-1">
              {" "}
              <button
                onClick={handleSpeakEnglish}
                disabled={isPlaying}
                className="px-4 py-2 bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center gap-2 border border-gray-200 no-drag"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776L4.36 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.36l4.023-3.776zM15.657 6.343a1 1 0 011.414 0A8.971 8.971 0 0119 12a8.971 8.971 0 01-1.929 5.657 1 1 0 11-1.414-1.414A6.971 6.971 0 0017 12a6.971 6.971 0 00-1.343-4.243 1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>播放</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                  Ctrl+'
                </span>
              </button>
              {isCorrect !== true && !showAnswer && (
                <>
                  {" "}
                  <button
                    onClick={checkAnswer}
                    disabled={wordInputs.some((input) => !input.trim())}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-300 transition-colors flex items-center gap-2 no-drag"
                  >
                    <span>检查</span>
                    <span className="text-xs bg-blue-500 px-2 py-1 rounded text-blue-100">
                      Enter
                    </span>
                  </button>{" "}
                  <button
                    onClick={showCorrectAnswer}
                    className="px-4 py-2 bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 border border-gray-200 no-drag"
                  >
                    <span>显示答案</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                      Ctrl+N
                    </span>
                  </button>
                </>
              )}
              {(isCorrect === true || showAnswer) && (
                <button
                  onClick={nextSentence}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 no-drag"
                >
                  <span>下一句</span>
                  <span className="text-xs bg-blue-500 px-2 py-1 rounded text-blue-100">
                    Enter
                  </span>
                </button>
              )}
              {
                <button
                  onClick={window.electronAPI.toggleFloatingMode}
                  className="px-4 py-2 bg-white text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 border border-gray-200 no-drag"
                >
                  <span>切换窗口化</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500">
                    Ctrl+Shift+P
                  </span>
                </button>
              }
            </div>
          </div>{" "}
          {/* 右侧的语音设置按钮和窗口化 */}
          <div className="flex items-center gap-4">
            {" "}
            <SpeechSettings
              compact={true}
              onOpenSettings={() => setIsDrawerOpen(true)}
              className="border border-gray-200 no-drag"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SentencePractice;
