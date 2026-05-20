import { useMemo, useRef, useState } from "react";
import "./App.css";

const WORDS = [
  { id: 1, answer: "STATISTICS", row: 1, col: 1, dir: "across", clue: "Optimizer'ın sorgu planı hazırlarken baktığı veri dağılım bilgisi." },
  { id: 2, answer: "TEMPDB", row: 1, col: 2, dir: "down", clue: "Sort, hash ve geçici işlemlerin ortak uğrak yeri." },
  { id: 3, answer: "INDEX", row: 1, col: 5, dir: "down", clue: "Tablo verilerine daha hızlı erişim sağlayan yapı." },
  { id: 4, answer: "SCAN", row: 1, col: 1, dir: "down", clue: "SQL Server'ın indeksi baştan sona okuma davranışı." },
  { id: 5, answer: "SEEK", row: 4, col: 4, dir: "across", clue: "İndeks üzerinden doğrudan hedef kayda gitme davranışı." },
  { id: 6, answer: "REBUILD", row: 6, col: 1, dir: "down", clue: "Parçalanmış indeksi sıfırdan yeniden oluşturma işlemi." },
  { id: 7, answer: "MEMORY", row: 7, col: 5, dir: "down", clue: "SQL Server'ın veri sayfalarını ve planları tuttuğu kritik kaynak." },
  { id: 8, answer: "BUFFER", row: 8, col: 1, dir: "across", clue: "Diskten okunan sayfaların RAM'de tutulduğu alan." },
  { id: 9, answer: "MAXDOP", row: 10, col: 6, dir: "across", clue: "Bir sorgunun en fazla kaç CPU çekirdeği kullanacağını belirleyen ayar." },
  { id: 10, answer: "DMV", row: 10, col: 9, dir: "down", clue: "SQL Server'ın canlı sağlık ve performans bilgilerini veren sistem görünümleri." },
];

const SIZE = 13;

function buildGrid() {
  const grid = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({
      letter: "",
      numbers: [],
    }))
  );

  WORDS.forEach((word) => {
    [...word.answer].forEach((letter, i) => {
      const r = word.row + (word.dir === "down" ? i : 0);
      const c = word.col + (word.dir === "across" ? i : 0);
      grid[r][c].letter = letter;
    });

    grid[word.row][word.col].numbers.push(word.id);
  });

  return grid;
}

export default function App() {
  const grid = useMemo(() => buildGrid(), []);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const inputRefs = useRef({});
  const [activeDirection, setActiveDirection] = useState("across");
  const [activeWordId, setActiveWordId] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  const total = grid.flat().filter((cell) => cell.letter).length;

  const correct = grid.flatMap((row, r) =>
    row.map((cell, c) => {
      if (!cell.letter) return false;
      return answers[`${r}-${c}`] === cell.letter;
    })
  ).filter(Boolean).length;

  const score = Math.round((correct / total) * 100);

function findNextCell(r, c) {
  const word = WORDS.find((item) => {
    if (item.dir !== activeDirection) return false;

    if (item.dir === "across") {
      return item.row === r && c >= item.col && c < item.col + item.answer.length;
    }

    return item.col === c && r >= item.row && r < item.row + item.answer.length;
  });

  if (!word) return null;

  if (word.dir === "across") {
    const nextCol = c + 1;
    if (nextCol < word.col + word.answer.length) {
      return `${r}-${nextCol}`;
    }
  }

  if (word.dir === "down") {
    const nextRow = r + 1;
    if (nextRow < word.row + word.answer.length) {
      return `${nextRow}-${c}`;
    }
  }

  return null;
}

function getWordsAtCell(r, c) {
  return WORDS.filter((word) => {
    if (word.dir === "across") {
      return (
        word.row === r &&
        c >= word.col &&
        c < word.col + word.answer.length
      );
    }

    if (word.dir === "down") {
      return (
        word.col === c &&
        r >= word.row &&
        r < word.row + word.answer.length
      );
    }

    return false;
  });
}

function getWordAtCell(r, c) {
  const words = getWordsAtCell(r, c);

  if (words.length === 0) return null;

  const startingWord = words.find((word) => word.row === r && word.col === c);

  if (startingWord) {
    return startingWord;
  }

  const sameDirectionWord = words.find((word) => word.dir === activeDirection);

  if (sameDirectionWord) {
    return sameDirectionWord;
  }

  return words[0];
}

function handleChange(r, c, value) {
  const clean = value.replace(/[^a-zA-Z]/g, "").slice(-1).toUpperCase();

  setAnswers({
    ...answers,
    [`${r}-${c}`]: clean,
  });

  setChecked(false);

  if (clean) {
    const nextKey = findNextCell(r, c);

    if (nextKey && inputRefs.current[nextKey]) {
      inputRefs.current[nextKey].focus();
    }
  }
}

  function resetGame() {
    setAnswers({});
    setChecked(false);
  }

  function selectWord(word) {
  setActiveWordId(word.id);
  setActiveDirection(word.dir);

  const key = `${word.row}-${word.col}`;

  setTimeout(() => {
    inputRefs.current[key]?.focus();
  }, 0);
}

  return (
    <div className="page">
      <header className="hero">
        <div>
          <div className="badge">Di & Pi LinkedIn Mini Game</div>
          <h1>Veri Bulmacası #001</h1>
          <p>SQL Server bilenleri 3 dakikalık çapraz bulmacaya alalım.</p>
        </div>

        <div className="score">
          <span>Skor</span>
          <strong>{score}</strong>
        </div>
{score === 100 && (
  <div className="success-overlay">
    <div className="success-modal">
      <h2>🎉 Tebrikler!</h2>
      <p>Di sevindi, Pi kahvesini dökmeden onayladı.</p>
      <div className="success-badge">
        DATA PLATFORM Certified Crossword Solver
      </div>
      <button onClick={resetGame}>Yeni deneme</button>
    </div>
  </div>
)}
 
        <div className="mascots">
          <div
  className="mascot-card mascot-clickable"
  onClick={() => setShowHelp(true)}
  title="Di'den ipucu al"
>
  <img src="/di-ui.png" alt="Di" />
</div>

          <div className="mascot-card">
            <img src="/pi-ui.png" alt="Pi" />
            <div className="speech teal">Planlı çalış, kazan!</div>
          </div>
        </div>
      </header>

      <main className="layout">
        <section className="board">
          <div className="grid">
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const key = `${r}-${c}`;
                const value = answers[key] || "";
                const isWrong = checked && cell.letter && value && value !== cell.letter;
                const isRight = checked && cell.letter && value === cell.letter;
                const activeWord = WORDS.find((w) => w.id === activeWordId);

let isActive = false;

if (activeWord) {
  if (activeWord.dir === "across") {
    isActive =
      r === activeWord.row &&
      c >= activeWord.col &&
      c < activeWord.col + activeWord.answer.length;
  }

  if (activeWord.dir === "down") {
    isActive =
      c === activeWord.col &&
      r >= activeWord.row &&
      r < activeWord.row + activeWord.answer.length;
  }
}

                return (
                  <div
                    key={key}
                    className={`cell ${cell.letter ? "white" : "black"} 
  ${isWrong ? "wrong" : ""}
  ${isRight ? "right" : ""}
  ${isActive ? "active" : ""}
`}
                  >
                    {cell.numbers?.length > 0 && (
  <span className="num">
    {cell.numbers.join("/")}
  </span>
)}

                    {cell.letter && (
                    <input
                      ref={(el) => {
                        inputRefs.current[key] = el;
                      }}
                      value={value}
                      maxLength={1}
onFocus={() => {
  const word = getWordAtCell(r, c);

  if (word && activeWordId === null) {
    setActiveDirection(word.dir);
    setActiveWordId(word.id);
  }
}}
onClick={() => {
  const words = getWordsAtCell(r, c);

  if (words.length === 0) return;

  if (words.length === 1) {
    setActiveDirection(words[0].dir);
    setActiveWordId(words[0].id);
    return;
  }

  const currentIndex = words.findIndex((word) => word.id === activeWordId);
  const nextWord = words[(currentIndex + 1) % words.length];

  setActiveDirection(nextWord.dir);
  setActiveWordId(nextWord.id);
}}
                      onChange={(e) => handleChange(r, c, e.target.value)}

                      onKeyDown={(e) => {
                      if (e.key === "Backspace" && !value) {
                        let prevKey = null;

                        if (activeDirection === "across") {
                          prevKey = `${r}-${c - 1}`;
                        }

                        if (activeDirection === "down") {
                          prevKey = `${r - 1}-${c}`;
                        }

                        if (prevKey && inputRefs.current[prevKey]) {
                          setAnswers((prev) => ({
                            ...prev,
                            [prevKey]: "",
                          }));

                          inputRefs.current[prevKey].focus();
                        }
                      }
                    }}
                    />
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div className="brand-row">
  {"DATA PLATFORM".split("").map((char, i) => (
    <div key={i} className={`brand-cell ${char === " " ? "space" : ""}`}>
      {char === " " ? "" : char}
    </div>
  ))}
</div>
        </section>

        <section className="panel">
          <h2>Sorular</h2>

          <h3>Yatay</h3>
{WORDS.filter((w) => w.dir === "across").map((w) => (
  <p
    key={w.id}
    className={activeWordId === w.id ? "active-clue" : ""}
    onClick={() => selectWord(w)}
  >
    <b>{w.id}.</b> {w.clue}
  </p>
))}

          <h3>Dikey</h3>
{WORDS.filter((w) => w.dir === "down").map((w) => (
  <p
    key={w.id}
    className={activeWordId === w.id ? "active-clue" : ""}
    onClick={() => selectWord(w)}
  >
    <b>{w.id}.</b> {w.clue}
  </p>
))}

          <div className="buttons">
            <button onClick={() => setChecked(true)}>Kontrol Et</button>
            <button className="secondary" onClick={resetGame}>
              Sıfırla
            </button>
          </div>

          {score === 100 && (
            <div className="success">
              Tamamlandı. Di sevindi, Pi kahvesini dökmeden onayladı.
            </div>
          )}
        </section>
      </main>
      {showHelp && (
  <div className="help-overlay" onClick={() => setShowHelp(false)}>
    <div className="help-modal" onClick={(e) => e.stopPropagation()}>
      <h2>Di’den İpucu</h2>

      <p>
        Kutulara harf yazınca otomatik ilerlersin.
        Kesişim kutularına tekrar tıklarsan yön değiştirebilirsin.
      </p>

      <p>
        Sağdaki sorulara tıklayarak ilgili kelimeyi seçebilirsin.
        Sonra <b>Kontrol Et</b> ile doğru ve yanlışları görebilirsin.
      </p>

      <button onClick={() => setShowHelp(false)}>
        Tamam, çözüyorum
      </button>
    </div>
  </div>
)}
    </div>
  );
}