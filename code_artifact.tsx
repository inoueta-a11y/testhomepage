import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, Phone, Mail, MapPin, ArrowRight, Upload, Sparkles, RefreshCw, Sliders, Image as ImageIcon } from 'lucide-react';

// ==========================================
// 【超頑丈】画像ファイルを確実にロードするための自動パス解決画像コンポーネント
// ==========================================
const DynamicImage = ({ filename, alt, className, height = "h-64", placeholderText, showUploader = false, onFileUploaded }) => {
  const [pathCandidates, setPathCandidates] = useState([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [imgLoadFailed, setImgLoadFailed] = useState(false);
  const [customImage, setCustomImage] = useState('');

  useEffect(() => {
    if (showUploader) {
      const cached = localStorage.getItem(`c3_cached_${filename}`);
      if (cached) {
        setCustomImage(cached);
      }
    }
  }, [filename, showUploader]);

  useEffect(() => {
    if (customImage) return;

    const origin = window.location.origin;
    const path = window.location.pathname;
    const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
    const parts = cleanPath.split('/').filter(Boolean);
    
    const candidates = [];
    if (parts.length > 0 && parts[parts.length - 1].includes('.')) {
      parts.pop();
    }
    
    let currentParts = [...parts];
    while (currentParts.length >= 0) {
      const dirPath = currentParts.length > 0 ? '/' + currentParts.join('/') : '';
      candidates.push(`${origin}${dirPath}/${filename}`);
      if (currentParts.length === 0) break;
      currentParts.pop();
    }

    candidates.push(filename);
    candidates.push(`./${filename}`);
    candidates.push(`/${filename}`);
    candidates.push(`../${filename}`);
    candidates.push(`/src/${filename}`);
    candidates.push(`/public/${filename}`);

    setPathCandidates([...new Set(candidates)]);
  }, [filename, customImage]);

  const handleImageError = () => {
    if (currentPathIndex < pathCandidates.length - 1) {
      setCurrentPathIndex(currentPathIndex + 1);
    } else {
      setImgLoadFailed(true);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        setCustomImage(base64Data);
        localStorage.setItem(`c3_cached_${filename}`, base64Data);
        setImgLoadFailed(false);
        if (onFileUploaded) onFileUploaded(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    setCustomImage('');
    localStorage.removeItem(`c3_cached_${filename}`);
    setCurrentPathIndex(0);
    setImgLoadFailed(false);
  };

  if (customImage) {
    return (
      <div className="relative w-full h-full">
        <img src={customImage} alt={alt} className={className} />
        {showUploader && (
          <button onClick={handleResetImage} className="absolute bottom-2 right-2 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold py-1 px-2 rounded shadow">
            リセット
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {imgLoadFailed || pathCandidates.length === 0 ? (
        <div className={`w-full ${height} bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-500 border border-gray-300 ${className}`}>
          <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <span className="text-sm font-semibold text-center px-4 mb-2">{placeholderText || alt}</span>
          <span className="text-[10px] text-gray-400">※サーバー上で画像が見つかりません</span>
        </div>
      ) : (
        <img 
          src={pathCandidates[currentPathIndex]} 
          alt={alt} 
          className={className} 
          onError={handleImageError}
          loading="lazy"
        />
      )}

      {showUploader && (
        <div className="absolute bottom-3 left-3 right-3 text-center bg-black/60 backdrop-blur-sm p-2 rounded">
          <label className="cursor-pointer text-white text-[10px] font-bold py-1 px-2 rounded inline-flex items-center justify-center transition-colors">
            <Upload size={10} className="mr-1" />
            ファイル「{filename}」を選択して強制表示
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>
      )}
    </div>
  );
};

// 画像プレースホルダー（非写真アセット用）
const ImagePlaceholder = ({ text, height = "h-64", className = "" }) => (
  <div className={`w-full ${height} bg-gray-200 flex flex-col items-center justify-center text-gray-500 border border-gray-300 ${className}`}>
    <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
    </svg>
    <span className="text-sm md:text-base text-center px-4 font-medium">{text}</span>
  </div>
);

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // ページ上部へスクロール
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const navItems = [
    { id: 'home', label: 'ホーム' },
    { id: 'business', label: '事業内容' },
    { id: 'activity', label: '地域活動' },
    { id: 'volunteer', label: '環境見守り隊' },
    { id: 'profile', label: '代表プロフィール' },
    { id: 'company', label: '会社概要' },
    { id: 'contact', label: 'お問い合わせ' },
  ];

  const handleNavClick = (id) => {
    setCurrentPage(id);
    setIsMenuOpen(false);
  };

  const Header = () => (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 cursor-pointer" onClick={() => handleNavClick('home')}>
            <h1 className="text-2xl font-bold text-emerald-900 tracking-wider">株式会社シースリー</h1>
          </div>
          
          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm font-medium transition-colors hover:text-emerald-700 ${
                  currentPage === item.id ? 'text-emerald-800 border-b-2 border-emerald-800' : 'text-gray-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-emerald-800 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full text-left px-3 py-4 text-base font-medium ${
                  currentPage === item.id ? 'text-emerald-800 bg-emerald-50' : 'text-gray-600 hover:text-emerald-800 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );

  const Footer = () => (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-bold mb-4">株式会社シースリー</h2>
            <p className="text-gray-400 mb-2">〒300-0026</p>
            <p className="text-gray-400 mb-2">茨城県土浦市おおつ野8-3-6</p>
            <p className="text-gray-400">地域環境整備活動・土地活用関連相談・盛土関連事業調整・地域活動</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2">メニュー</h3>
            <ul className="space-y-2">
               {navItems.map((item) => (
                <li key={`footer-${item.id}`}>
                  <button onClick={() => handleNavClick(item.id)} className="text-gray-400 hover:text-white transition-colors">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 mt-8">
          <p className="text-xs text-gray-400 leading-relaxed mb-4">
            ※当社は、相談内容に応じて、各分野の専門事業者及び関係機関と連携しながら対応しております。<br />
            不動産売買・仲介、建設工事、各種許認可申請、専門的施工等については、必要に応じて適任の有資格者、許可業者、専門事業者と連携して対応致します。
          </p>
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} 株式会社シースリー. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );

  const PageHeader = ({ title }) => (
    <div className="bg-emerald-900 text-white py-12 mb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-bold">{title}</h1>
      </div>
    </div>
  );

  // --- Pages ---

  const HomePage = () => {
    // 【Gemini 3 Image / Imagen 4.0】リアルタイム画像生成ステート
    const [heroImage, setHeroImage] = useState(() => localStorage.getItem('c3_hero_image') || '');
    const [isGenerating, setIsGenerating] = useState(false);
    const [genError, setGenError] = useState('');
    const [showControl, setShowControl] = useState(false);
    const [imagePrompt, setImagePrompt] = useState('筑波山と土浦の美しい田園風景、澄み切った青空と豊かな日本の大自然、クリーンな持続可能性のイメージ、プロフェッショナルなウェブサイト用ヒーロー背景写真、高品質、きらめく朝日');

    // プリセットプロンプトリスト
    const presets = [
      {
        label: "土浦と筑波山の調和 (デフォルト)",
        prompt: "Beautiful view of Mt. Tsukuba from Tsuchiura, Ibaraki, lush green agriculture land, peaceful Japanese countryside scenery, blue sky with clean white clouds, soft bright sunlight, professional website hero background style"
      },
      {
        label: "持続可能な未来エネルギー",
        prompt: "A futuristic eco-friendly green landscape with subtle high-tech perovskite solar panels and grid storage batteries beautifully harmonized with Japanese nature, flowing clean stream, soft lens flare, high-end commercial photo"
      },
      {
        label: "温もりある地域コミュニティ",
        prompt: "Warm and welcoming Japanese local community center surrounded by beautiful cherry blossoms and green oak trees, people walking and smiling, soft pastel watercolor digital art style, inviting and safe town view"
      }
    ];

    // 指数バックオフ付き画像生成処理 (Imagen 4.0 predictエンドポイント)
    const generateHeroImage = async (promptText) => {
      setIsGenerating(true);
      setGenError('');
      
      const apiKey = ""; // プレビュー環境提供キー
      const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
      const payload = {
        instances: { prompt: promptText },
        parameters: { sampleCount: 1 }
      };

      const maxRetries = 5;
      let delay = 1000;
      let success = false;
      let resultData = null;

      // エラー修正：attempt変数のみを使用し、未定義の i によるエラーを解消
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            resultData = await response.json();
            success = true;
            break;
          }
          throw new Error(`HTTP Error: ${response.status}`);
        } catch (err) {
          if (attempt === maxRetries - 1) {
            break;
          }
          // 指数バックオフ (1s, 2s, 4s, 8s, 16s)
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }

      if (success && resultData?.predictions?.[0]?.bytesBase64Encoded) {
        const base64Bytes = resultData.predictions[0].bytesBase64Encoded;
        const generatedUrl = `data:image/png;base64,${base64Bytes}`;
        setHeroImage(generatedUrl);
        localStorage.setItem('c3_hero_image', generatedUrl);
      } else {
        setGenError('お写真の生成中に問題が発生しました。少し時間を置いて再度実行していただくか、プレセットを変更してお試しください。');
      }
      setIsGenerating(false);
    };

    // 初回マウント時、背景画像がなければ自動生成を開始
    useEffect(() => {
      if (!heroImage) {
        generateHeroImage(presets[0].prompt);
      }
    }, []);

    const handlePresetClick = (promptText) => {
      setImagePrompt(promptText);
      generateHeroImage(promptText);
    };

    const handleCustomSubmit = (e) => {
      e.preventDefault();
      if (!imagePrompt.trim()) return;
      generateHeroImage(imagePrompt);
    };

    return (
      <div className="animate-fadeIn">
        {/* Dynamic AI Hero Section */}
        <div className="relative bg-gray-950 h-[480px] md:h-[550px] flex items-center justify-center overflow-hidden transition-all duration-700">
          
          {/* 生成されたイメージ背景 */}
          {heroImage ? (
            <div className="absolute inset-0 z-0 animate-fadeIn">
              <img src={heroImage} alt="株式会社シースリー コンセプト背景" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-emerald-950/20 z-0"></div>
            </div>
          ) : (
            <div className="absolute inset-0 z-0 bg-emerald-950/30 flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin mb-4"></div>
                <p className="text-emerald-100 text-sm font-semibold tracking-wider">AIが会社のコンセプト背景画像を生成しています...</p>
              </div>
            </div>
          )}

          {/* 生成中のオーバーレイ */}
          {isGenerating && heroImage && (
            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center transition-all">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex flex-col items-center max-w-sm text-center">
                <RefreshCw className="text-emerald-400 animate-spin mb-4" size={32} />
                <p className="text-white text-sm font-bold tracking-wide">Imagen 4.0 AIが新しい背景を創り出しています...</p>
                <p className="text-gray-300 text-xs mt-2">これには最大10秒ほどかかる場合があります</p>
              </div>
            </div>
          )}

          {/* ヒーローキャッチコピー */}
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <span className="bg-emerald-800/80 backdrop-blur-md text-emerald-100 text-xs font-bold px-3.5 py-1.5 rounded-full mb-6 tracking-widest inline-block border border-emerald-500/30">
              LAND, ENVIRONMENT & COMMUNITY
            </span>
            <h1 className="text-3xl md:text-6xl font-extrabold text-white mb-6 tracking-wide leading-tight drop-shadow-xl">
              地域と環境を守り、<br className="md:hidden" />人と事業をつなぐ。
            </h1>
            <p className="text-base md:text-xl text-emerald-100/90 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-lg mb-8">
              茨城県南地域を中心に、土地活用から持続可能な次世代エネルギー調整にいたるまで、地域環境に寄り添うパートナーシップを結びます。
            </p>
            <div className="flex justify-center gap-4">
              <button onClick={() => handleNavClick('business')} className="bg-emerald-800 text-white font-bold text-sm px-6 py-3.5 rounded-lg shadow-lg hover:bg-emerald-700 transition-all hover:scale-105">
                事業内容を見る
              </button>
              <button onClick={() => handleNavClick('contact')} className="bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold text-sm px-6 py-3.5 rounded-lg shadow-lg hover:bg-white/20 transition-all">
                お問い合わせはこちら
              </button>
            </div>
          </div>

          {/* ✨ AI背景イメージ・ジェネレーター操作パネル (ヒーローの右下にフロート配置) */}
          <div className="absolute bottom-4 right-4 z-30">
            {!showControl ? (
              <button 
                onClick={() => setShowControl(true)} 
                className="bg-emerald-900/90 backdrop-blur-md hover:bg-emerald-800 text-white text-xs font-bold py-2.5 px-4 rounded-full flex items-center gap-2 shadow-lg border border-emerald-500/40 transition-transform active:scale-95"
              >
                <Sparkles size={14} className="text-amber-300 animate-pulse" />
                <span>✨ 会社のイメージ背景をAIでつくる</span>
              </button>
            ) : (
              <div className="bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-xl p-5 shadow-2xl max-w-sm w-[340px] text-left text-white animate-slideUp">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                  <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-300" />
                    AI背景ジェネレータースタジオ (Imagen 4.0)
                  </h4>
                  <button onClick={() => setShowControl(false)} className="text-gray-400 hover:text-white">
                    <X size={16} />
                  </button>
                </div>

                {/* プリセット選択 */}
                <div className="mb-4">
                  <span className="block text-[10px] text-gray-400 font-bold mb-2">おすすめプリセット</span>
                  <div className="space-y-1.5">
                    {presets.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => handlePresetClick(p.prompt)}
                        className="w-full text-left bg-gray-800 hover:bg-emerald-950 hover:border-emerald-700/50 border border-transparent text-[11px] py-1.5 px-2.5 rounded transition-all leading-normal text-gray-300"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* カスタムプロンプト */}
                <form onSubmit={handleCustomSubmit} className="space-y-3">
                  <div>
                    <span className="block text-[10px] text-gray-400 font-bold mb-1.5">プロンプトを自由に変更</span>
                    <textarea
                      rows="2"
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
                      placeholder="日本語または英語で背景イメージを入力してください"
                    />
                  </div>
                  {genError && <p className="text-[10px] text-red-400 font-medium leading-normal">{genError}</p>}
                  
                  <div className="flex gap-2 justify-end pt-2 border-t border-gray-800">
                    <button
                      type="button"
                      onClick={() => { localStorage.removeItem('c3_hero_image'); setHeroImage(''); generateHeroImage(presets[0].prompt); }}
                      className="bg-gray-800 hover:bg-gray-700 text-[10px] font-bold py-1.5 px-3 rounded"
                    >
                      初期化
                    </button>
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold py-1.5 px-4 rounded inline-flex items-center gap-1 shadow"
                    >
                      背景をAI生成 🚀
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white p-8 md:p-12 shadow-sm border border-gray-100 rounded-lg mb-16">
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              株式会社シースリーは、茨城県南地域を中心に、地域環境整備、土地活用関連相談、盛土関連事業の調整、建設関連ネットワーク支援、地域安全活動等を行っております。
            </p>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              当社は、各分野の専門事業者、関係機関、地域の皆様との連携を大切にしながら、地域課題の解決に向けた事業調整及び提案活動に取り組んでおります。<br />
              不動産、建設、運搬、測量、施工、地域説明等、各分野において必要となる専門性については、適任の事業者及び関係者と連携し、事業全体が円滑に進むよう調整役として活動しております。
            </p>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
              また、東日本大震災をきっかけに災害支援活動へ参加し、現在も地域安全活動、環境保全活動、不法投棄防止活動等に積極的に取り組んでおります。<br />
              近年、石岡市内において発生した大規模な不法投棄問題を受け、地域住民の皆様と協力しながら、「環境見守り隊」ボランティア活動も行っております。
            </p>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed font-medium text-emerald-800">
              地域との対話を大切にし、安全性、透明性、法令順守を重視した活動を通じ、地域社会へ貢献して参ります。
            </p>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">地域環境整備</h3>
              <p className="text-gray-600 mb-6">荒廃地・遊休地の改善提案、盛土関連事業の調整・取りまとめなど。</p>
              <button onClick={() => handleNavClick('business')} className="text-emerald-700 font-medium hover:text-emerald-900 inline-flex items-center">
                詳細を見る <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Menu size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">地域活動</h3>
              <p className="text-gray-600 mb-6">環境見守り隊による不法投棄防止活動、地域安全活動の実施。</p>
              <button onClick={() => handleNavClick('activity')} className="text-emerald-700 font-medium hover:text-emerald-900 inline-flex items-center">
                詳細を見る <ArrowRight size={16} className="ml-1" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">災害支援</h3>
              <p className="text-gray-600 mb-6">東日本大震災をはじめとする、各地での災害ボランティア支援経験。</p>
              <button onClick={() => handleNavClick('activity')} className="text-emerald-700 font-medium hover:text-emerald-900 inline-flex items-center">
                詳細を見る <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
          </div>

          {/* 企業理念 */}
          <div className="bg-emerald-900 text-white rounded-lg p-8 md:p-12 mb-16 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center border-b border-emerald-700 pb-4 inline-block">企業理念</h2>
              <div className="text-center mb-8">
                <h3 className="text-xl md:text-2xl font-semibold mb-4 tracking-wider">地域のために出来る事を続ける。</h3>
              </div>
              <p className="text-gray-100 leading-relaxed mb-4">
                株式会社シースリーは、人と地域とのつながりを大切にし、土地、環境、安全、地域活動を通じて、地域社会へ貢献することを理念としております。
              </p>
              <p className="text-gray-100 leading-relaxed mb-4">
                私たちは、すべてを自社のみで行うのではなく、それぞれの分野に精通した専門事業者、地域関係者、行政関係機関等との連携を重視し、地域にとって必要な事業を円滑に進めるための調整役として活動しております。
              </p>
              <p className="text-gray-100 leading-relaxed">
                災害支援活動、環境保全活動、地域見守り活動等にも積極的に取り組み、地域に信頼される存在を目指しております。
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <button onClick={() => handleNavClick('volunteer')} className="bg-white border-2 border-emerald-800 text-emerald-800 px-8 py-4 rounded font-bold hover:bg-emerald-50 transition-colors">
              環境見守り隊について
            </button>
            <button onClick={() => handleNavClick('contact')} className="bg-emerald-800 text-white px-8 py-4 rounded font-bold hover:bg-emerald-900 transition-colors">
              お問い合わせはこちら
            </button>
          </div>
        </div>
      </div>
    );
  };

  const BusinessPage = () => (
    <div className="animate-fadeIn pb-16">
      <PageHeader title="事業内容" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <p className="text-lg text-gray-700 leading-relaxed">
            株式会社シースリーでは、地域環境整備、土地活用、盛土関連事業、建設関連ネットワーク支援、さらにはライフスタイルに関連する理容・輸入小売事業にいたるまで、各分野の専門事業者と連携しながら、相談対応及び事業調整を行っております。<br /><br />
            当社は、すべてを自社のみで行うのではなく、内容に応じて適任の事業者、専門家、関係機関と連携し、事業が円滑に進むよう調整役として活動しております。
          </p>
        </div>

        {/* ＝＝ ライフスタイル＆空間創造事業 (大型・高貴デザイン枠) ＝＝ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-emerald-900 mb-8 border-l-4 border-emerald-800 pl-4">
            ライフスタイル・インテリア＆ビューティー事業
          </h2>

          <div className="space-y-12">
            {/* 特注枠1：理容室経営 (ヘアーサロンINA) */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <ImagePlaceholder text="画像挿入：ヘアーサロンINA 店舗外観・内観風景" height="h-full min-h-[300px]" />
                </div>
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-white to-emerald-50/20">
                  <span className="bg-emerald-800 text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-4">地域密着型サービス</span>
                  <h3 className="text-2xl md:text-3xl font-bold text-emerald-900 mb-4 border-b-2 border-emerald-100 pb-2">理容室経営（ヘアーサロンINA）</h3>
                  <p className="text-gray-800 font-semibold mb-3">土浦市神立町にて、地域に深く根ざしたヘアサロンを運営しております。</p>
                  <p className="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">
                    小さなお子様からご年配の方まで、地域の皆様に長く愛されるアットホームなヘアサロンを目指し、日々の営業を続けております。
                    人と地域との繋がり、日常の対話を何よりも大切にしており、単に髪を整える場所というだけでなく、皆様の心が休まる心地良い憩いの空間として、信頼を寄せていただいております。
                  </p>
                  <p className="text-gray-650 text-xs italic">所在地：茨城県土浦市神立町 （各種お問い合わせは店舗、または弊社窓口までお気軽にどうぞ）</p>
                </div>
              </div>
            </div>

            {/* 特注枠2：ヨーロッパ家具の輸入・販売 (アップロード画像をフルサイズで組み込み) */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="md:flex md:flex-row-reverse">
                <div className="md:w-1/2 relative bg-gray-100">
                  {/* PXL_20260603_053233608.jpg を呼び出し表示 */}
                  <DynamicImage 
                    filename="PXL_20260603_053233608.jpg" 
                    alt="ヨーロッパ輸入家具 展示ショールーム" 
                    className="w-full h-full object-cover min-h-[350px]"
                    height="h-[350px]"
                    showUploader={true}
                  />
                </div>
                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-white to-amber-50/20">
                  <span className="bg-amber-800 text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-4">空間プロデュース</span>
                  <h3 className="text-2xl md:text-3xl font-bold text-amber-950 mb-4 border-b-2 border-amber-100 pb-2">ヨーロッパ家具の輸入・販売</h3>
                  <p className="text-gray-800 font-semibold mb-3">洗練されたロココ調やクラシック様式の厳選家具を、ヨーロッパより直接コーディネート。</p>
                  <p className="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">
                    独自のグローバルアライアンスを活かし、気品溢れる大理石トップの豪華なダイニングテーブル、繊細な彫刻が施された木製チェア、優美なガラスキャビネットなどの直輸入仲介・販売コーディネートを行っております。
                    こだわり抜いた空間を創造したいホテル・店舗様や、特別感のあるインテリアを求められる個人邸・リノベーション物件に向けて、「一生ものの出会い」をお届けします。
                  </p>
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded text-xs text-amber-900 leading-relaxed">
                    <span className="font-bold">【ご提案の流れ】</span>
                    お客様の求める空間イメージをお伺いし、最適なメーカーや職人、アンティークマーケットから買付・輸入手続き、丁寧な配送設置までをワンストップで調整いたします。
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ＝＝ 主な調整・ネットワーク・地域整備事業 ＝＝ */}
        <h2 className="text-2xl font-bold text-emerald-900 mb-8 border-l-4 border-emerald-800 pl-4">
          地域調整・土地環境コーディネート事業
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 事業項目1 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
             <ImagePlaceholder text="画像挿入：荒廃地・遊休地の写真、草木が繁茂している土地など" height="h-48" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-emerald-900 mb-3 border-b-2 border-emerald-100 pb-2">1. 地域環境整備・土地活用提案</h3>
              <p className="text-gray-700 mb-3">荒廃地、遊休地、谷地形、管理が行き届きにくい土地等について、地域環境改善、安全性向上、土地の有効活用を目的とした提案活動を行っております。</p>
              <p className="text-gray-700 mb-3">長年管理が難しくなった土地では、雑草や竹木の繁茂、不法投棄、害虫・有害鳥獣の発生、火災時の延焼リスク等が懸念される場合があります。</p>
              <p className="text-gray-700">当社では、地域住民の皆様、地主様、関係事業者、関係機関との対話を重視し、地域環境の改善につながる方法を検討し、事業化に向けた調整を行っております。</p>
            </div>
          </div>

          {/* 事業項目2 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <ImagePlaceholder text="画像挿入：現場確認風景、測量・説明・打ち合わせ風景など" height="h-48" />
            <div className="p-6">
              <h3 className="text-xl font-bold text-emerald-900 mb-3 border-b-2 border-emerald-100 pb-2">2. 盛土関連事業の調整・取りまとめ</h3>
              <p className="text-gray-700 mb-3">地域環境改善及び土地の有効活用を目的とした盛土関連事業について、地主様対応、地域説明、関係事業者との調整、事業計画の取りまとめ等を行っております。</p>
              <p className="text-gray-700 mb-3">盛土関連事業は、地域住民の皆様の理解、安全対策、法令順守、行政手続き、関係事業者との連携が重要となる事業です。</p>
              <p className="text-gray-700">当社では、必要に応じて測量、設計、施工、運搬、各種申請等に関わる専門事業者と連携し、事業全体が適切かつ円滑に進むよう調整を行っております。当社は、地域との対話を大切にし、不安や疑問を残さない丁寧な説明を心掛け、透明性のある事業推進に努めております。</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* 事業項目3-4 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-emerald-900 mb-3">3. 土地活用・不動産関連相談</h3>
            <p className="text-gray-700 mb-3">栃木県宇都宮市を中心として、土地活用、不動産関連相談、空地・遊休地等に関する情報提供及び相談対応を行っております。</p>
            <p className="text-gray-700 mb-3">不動産に関する具体的な売買、仲介、契約業務等については、提携不動産会社及び適任の専門事業者と連携し、必要に応じて橋渡しを行っております。</p>
            <p className="text-gray-700">当社は、地域の土地情報や人脈を活かし、土地を所有されている方、土地活用を検討されている方、不動産に関する相談先を探している方に対し、適切な専門事業者へつなぐ役割を担っております。</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-emerald-900 mb-3">4. 建設関連ネットワーク支援</h3>
            <p className="text-gray-700 mb-3">建設関連分野において、各種事業者とのネットワークを活用し、相談内容に応じた事業者紹介、情報共有、事業調整等を行っております。</p>
            <p className="text-gray-700 mb-3">電気設備、計装、塗装、内装、外構、造成、運搬等、必要な分野に応じて、適任の事業者と連携しながら、事業が円滑に進むよう支援しております。</p>
            <p className="text-gray-700">当社は、無理に自社のみで対応するのではなく、内容に応じて専門性を持つ事業者へつなぐことを大切にしております。</p>
          </div>

          {/* 新規追加：飲食店サポート */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full w-max mb-3 block">経営サポート</span>
            <h3 className="text-xl font-bold text-emerald-900 mb-3">飲食店運営経験を活かした相談活動</h3>
            <p className="text-gray-700 mb-3">過去にラーメン店をはじめとする飲食店を実際に開業・運営していた経験をベースに、店舗運営、開業、メニュー開発、集客対策、店舗の撤退にいたるまで、現場目線に立った親身なアドバイスや情報交換を行っております。</p>
            <p className="text-gray-700 text-sm">無理なコンサルタントを気取るのではなく、実際の店舗経営者の方々と同じ視点で、課題解決に必要な提携ネットワークへの紹介や橋渡しを含めた支援を重視しております。</p>
          </div>

          {/* 事業項目5-7 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-emerald-900 mb-2">5. 電気・計装関連サポート</h3>
              <p className="text-gray-700 text-sm">電気設備、計装関連業務等について、これまでの現場経験及び事業者ネットワークを活かし、相談対応、業務支援、関係事業者との調整等を行っております。内容に応じて, 専門事業者と連携しながら、安全性及び確実性を重視した対応を心掛けております。</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-emerald-900 mb-2">6. 内装・外構関連サポート</h3>
              <p className="text-gray-700 text-sm">住宅, 店舗、建築物等に関する内装、クロス、塗装、外構、環境整備等について、各種相談及び関係事業者との調整支援を行っております。施工内容に応じて、適任の専門事業者と連携し、相談者様の目的に合った対応を目指しております。</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-emerald-900 mb-2">7. 特殊車両運搬関連サポート</h3>
              <p className="text-gray-700 text-sm">大型重機、建設機械、特殊車両等の運搬に関する相談及び関係事業者との調整支援を行っております。現場条件、運搬内容、必要車両等に応じて、適任の運搬事業者との連携を図り、円滑な事業進行を支援しております。</p>
            </div>
          </div>

          {/* 次世代エネルギー関連事業 */}
          <div className="bg-emerald-50 p-8 rounded-lg border-2 border-emerald-100 mt-12">
            <h2 className="text-2xl font-bold text-emerald-900 mb-4 flex items-center">
               <span className="bg-emerald-800 text-white text-sm px-3 py-1 rounded-full mr-3">注目</span>
               次世代エネルギー関連事業
            </h2>
            <p className="text-gray-800 mb-4 font-medium">株式会社シースリーでは、次世代エネルギー分野における事業連携支援及びプロジェクトコーディネートを行っております。</p>
            <p className="text-gray-700 mb-6">
              近年注目されている <strong>ペロブスカイト太陽電池</strong> や <strong>系統用蓄電池関連事業</strong> について、土地所有者様、事業者様、関係企業様との橋渡しを行い、事業が円滑に進むよう支援しております。
            </p>
            
            <div className="bg-white p-6 rounded border border-emerald-100 mb-6">
              <h4 className="font-bold text-emerald-800 mb-3 border-b border-gray-100 pb-2">主な活動内容</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700 list-disc list-inside">
                <li>系統用蓄電池事業に関する情報提供</li>
                <li>ペロブスカイト太陽電池関連情報の提供</li>
                <li>土地所有者と事業者のマッチング</li>
                <li>関係企業とのネットワーク構築支援</li>
                <li>事業計画に関する相談対応</li>
                <li>プロジェクトコーディネート</li>
                <li>地域との連携支援</li>
                <li>関係事業者紹介</li>
                <li>次世代エネルギー活用に関する情報収集及び発信</li>
              </ul>
            </div>

            <div className="bg-gray-800 text-white p-6 rounded shadow-inner">
               <h4 className="font-bold text-emerald-400 mb-2">シースリーの役割（スタンス）</h4>
               <p className="text-gray-300 text-sm leading-relaxed">
                 当社は、設計・施工・許認可業務を行う事業者ではなく、各分野の専門事業者と連携しながら、人と人、土地と事業、企業と地域をつなぐ調整役として活動しております。特定製品の販売や施工を目的とするものではなく、情報提供・導入検討に関する相談・関係事業者との連携支援を中心とした活動を行っております。
               </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  const ActivityPage = () => (
    <div className="animate-fadeIn pb-16">
      <PageHeader title="地域活動・社会貢献活動" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-lg text-gray-700 leading-relaxed mb-10 text-center">
          株式会社シースリーでは、事業活動だけでなく、災害支援、環境保全、不法投棄防止、地域安全活動等にも取り組んでおります。<br />
          代表 中村健作の地域活動の原点は、東日本大震災における災害ボランティア活動です。
        </p>

        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden mb-12">
          <div className="md:flex">
            <div className="md:w-1/3">
              <ImagePlaceholder text="画像挿入：災害ボランティア活動写真、炊き出し風景など" height="h-full min-h-[300px]" />
            </div>
            <div className="md:w-2/3 p-8">
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">東日本大震災 災害支援活動</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                代表 中村健作は、東日本大震災をきっかけに災害ボランティア活動へ参加し、福島県いわき市勿来地区、石巻市、気仙沼市、気仙沼大島等, 東北各地にて災害支援活動を行って参りました。炊き出し支援活動、復興支援活動、被災地支援活動、ワカメ復興支援活動等、多くの支援活動へ携わりました。
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                また, 平成23年には「石岡市災害ボランティアチーム」を発足し、約3年間にわたり活動を行いました。当時の活動におきましては、石岡市社会福祉協議会をはじめ、行政関係者の皆様、地域住民の皆様、学生の皆様、各種団体、ボランティア連絡協議会、区長会の皆様、そして地域を支えてこられた長老の皆様に、多大なるご支援とご協力を頂きました。
              </p>
              <p className="text-gray-700 font-medium">
                これらの経験は、現在の地域活動及び環境保全活動の原点となっております。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 mb-12 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">災害支援活動履歴</h3>
          <div className="max-w-3xl mx-auto">
            <ul className="space-y-4 text-gray-700">
              <li className="flex flex-col sm:flex-row">
                <span className="font-bold w-48 text-emerald-800">平成23年〜平成25年</span>
                <span className="flex-1">福島県いわき市勿来地区支援活動 / 福島県いわき市小名浜地区支援活動 / 宮城県石巻市復興支援活動 / 七ヶ浜支援活動 / 北上町十三浜支援活動 / 気仙沼支援活動 / 唐桑町支援活動 / 気仙沼大島支援活動 / 炊き出し支援活動 / ワカメ復興支援活動</span>
              </li>
              <li className="flex flex-col sm:flex-row border-t border-gray-200 pt-4">
                <span className="font-bold w-48 text-emerald-800">平成25年</span>
                <span className="flex-1">つくば市竜巻災害復興支援 / 山梨県豪雪災害復興支援</span>
              </li>
              <li className="flex flex-col sm:flex-row border-t border-gray-200 pt-4">
                <span className="font-bold w-48 text-emerald-800">平成27年</span>
                <span className="flex-1">常総市鬼怒川決壊水害復興支援</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="md:flex flex-row-reverse">
            <div className="md:w-1/3">
              <ImagePlaceholder text="画像挿入：環境見守り隊パトロール、清掃活動の写真など" height="h-full min-h-[300px]" />
            </div>
            <div className="md:w-2/3 p-8">
              <h2 className="text-2xl font-bold text-emerald-900 mb-4">環境見守り活動</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                近年、石岡市内において発生した大規模な不法投棄問題を受け、地域環境保全及び不法投棄防止活動を目的として、「環境見守り隊」ボランティア活動を開始しております。地域住民の皆様と協力しながら、地域の安全と環境を守る活動に取り組んでおります。
              </p>
              
              <h4 className="font-bold text-gray-800 mb-3">主な活動内容</h4>
              <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
                <li>不法投棄防止活動</li>
                <li>巡回監視活動</li>
                <li>清掃活動</li>
                <li>情報共有活動</li>
                <li>地域安全活動</li>
                <li>環境保全活動</li>
              </ul>
              
              <p className="text-emerald-800 font-bold bg-emerald-50 inline-block px-4 py-2 rounded">
                安心して暮らせる地域づくりを目指し、無理のない範囲で継続的な活動を行って参ります。
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const VolunteerPage = () => (
    <div className="animate-fadeIn pb-16">
      <div className="bg-emerald-800 text-white py-16 mb-10 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">環境見守り隊 ボランティア募集</h1>
          <p className="text-xl md:text-2xl text-emerald-100">地域環境を守る活動に参加しませんか?</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12 -mt-16 relative z-10">
          
          <div className="mb-10">
             <ImagePlaceholder text="画像挿入：環境見守り隊の腕章、ベスト、看板、または活動風景" height="h-64" className="rounded-lg mb-8" />
             <p className="text-lg text-gray-700 leading-relaxed mb-4">
              石岡市及び周辺地域では、近年、不法投棄問題や環境悪化問題が発生しております。<br />
              環境見守り隊では、地域住民の皆様と協力しながら、不法投棄防止及び地域環境保全活動を行っております。
             </p>
             <p className="text-lg text-gray-700 leading-relaxed font-medium">
              特別な資格や経験は必要ありません。<br />
              地域環境を守りたいという思いのある方、無理のない範囲で地域活動に参加したい方のご参加をお待ちしております。
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-bold text-emerald-900 mb-4 border-b pb-2">募集要項</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-700 text-sm">活動地域</h4>
                  <p className="text-gray-600">石岡市 / 土浦市 / 茨城県南地域</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-700 text-sm">主な活動内容</h4>
                  <p className="text-gray-600">不法投棄監視活動 / 清掃活動 / 巡回活動 / 情報共有活動 / 地域安全活動 / 環境保全活動</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-700 text-sm">参加対象</h4>
                  <ul className="text-gray-600 list-disc list-inside text-sm">
                    <li>地域環境保全活動に関心のある方</li>
                    <li>地域安全活動に協力頂ける方</li>
                    <li>ボランティア活動に興味のある方</li>
                    <li>不法投棄防止活動に関心のある方</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-lg border border-red-100">
              <h3 className="text-xl font-bold text-red-800 mb-4 border-b border-red-200 pb-2">活動上の注意事項</h3>
              <ul className="text-red-700 space-y-3 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">※</span>
                  活動は無理のない範囲で行います。
                </li>
                <li className="flex items-start">
                  <span className="mr-2">※</span>
                  危険箇所への立ち入り、無断撮影、個人情報の拡散、相手方との直接的なトラブルになる行為等は行いません。
                </li>
                <li className="flex items-start">
                  <span className="mr-2">※</span>
                  発見した不法投棄や危険箇所については、必要に応じて関係機関へ情報提供を行います。
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center bg-gray-100 p-8 rounded-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">参加方法</h3>
            <p className="text-gray-600 mb-6">
              参加希望、ご質問等ございましたら、お問い合わせフォームよりお気軽にご連絡下さい。
            </p>
            <button onClick={() => handleNavClick('contact')} className="bg-emerald-800 text-white px-8 py-3 rounded-full font-bold hover:bg-emerald-900 transition-colors inline-flex items-center shadow-md">
              <Mail className="mr-2" size={20} />
              お問い合わせフォームへ
            </button>
          </div>

        </div>
      </div>
    </div>
  );

  // 代表プロフィールコンポーネント (画像ロード問題を完全解決するアップロード機能を実装)
  const ProfilePage = () => {
    return (
      <div className="animate-fadeIn pb-16">
        <PageHeader title="代表プロフィール" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mb-12">
            <div className="md:flex">
              <div className="md:w-2/5 bg-gray-50 flex flex-col items-center justify-center p-8">
                {/* 額縁を模した美しいカード調フレームデザイン */}
                <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-[320px] w-full text-center">
                  
                  {/* C1DD659CCBFB50B4084C9D66E95D25D6E801B8E8.jpg を動的ロード */}
                  <DynamicImage 
                    filename="C1DD659CCBFB50B4084C9D66E95D25D6E801B8E8.jpg" 
                    alt="代表 中村健作" 
                    className="w-full h-auto object-cover rounded shadow-inner max-h-[380px]"
                    height="h-80"
                    placeholderText="代表：中村健作（フラワーアレンジメントを抱えたお写真）"
                    showUploader={true}
                  />
                  
                  <div className="mt-3 text-xs text-emerald-800 font-semibold tracking-wider">
                    温かい人と人との繋がりを大切に
                  </div>

                </div>
              </div>
              <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">中村 健作</h2>
                <p className="text-gray-500 mb-6 font-medium">代表取締役</p>
                
                <div className="space-y-4 text-gray-700 leading-relaxed">
                  <p>昭和49年、栃木県大田原市生まれ。</p>
                  <p>運転代行業、美容関連事業、飲食店運営、建設関連業務等、様々な経験を経て、現在は地域環境整備活動、土地活用関連相談、盛土関連事業の調整、地域活動等に取り組んでおります。</p>
                  <p>東日本大震災以降は、災害支援活動及び地域活動にも積極的に参加し, 人と人とのつながり、地域との対話を大切にした活動を続けております。</p>
                  <p>事業においては、自らがすべての専門業務を担うのである、内容に応じて適任の専門事業者と連携し、相談者様や地域にとってより良い形となるよう、事業調整及び橋渡しを行っております。</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-emerald-900 mb-6 border-b pb-2">保有資格・活動等</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center"><ChevronRight size={16} className="text-emerald-500 mr-2" /> 救急救命士</li>
                <li className="flex items-center"><ChevronRight size={16} className="text-emerald-500 mr-2" /> ガイドヘルパー（移動介護従事者）</li>
                <li className="flex items-center"><ChevronRight size={16} className="text-emerald-500 mr-2" /> 茨城県災害ボランティアリーダー養成員</li>
                <li className="flex items-center"><ChevronRight size={16} className="text-emerald-500 mr-2" /> ペロブスカイト関連アドバイザー会員</li>
                <li className="flex items-center"><ChevronRight size={16} className="text-emerald-500 mr-2" /> 石岡市災害ボランティアチーム発足・活動経験</li>
                <li className="flex items-center"><ChevronRight size={16} className="text-emerald-500 mr-2" /> 環境見守り隊活動</li>
              </ul>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-emerald-900 mb-6 border-b pb-2">趣味・その他</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center"><ChevronRight size={16} className="text-emerald-500 mr-2" /> ゴルフ</li>
                <li className="flex items-center"><ChevronRight size={16} className="text-emerald-500 mr-2" /> 書道</li>
                <li className="flex items-center"><ChevronRight size={16} className="text-emerald-500 mr-2" /> 地域活動</li>
                <li className="flex items-center"><ChevronRight size={16} className="text-emerald-500 mr-2" /> 愛犬との時間</li>
              </ul>
            </div>
          </div>

          <div className="bg-emerald-50 p-8 md:p-12 rounded-xl border border-emerald-100">
            <h3 className="text-2xl font-bold text-emerald-900 mb-6">代表挨拶</h3>
            <div className="space-y-4 text-gray-800 leading-relaxed">
              <p>はじめまして。株式会社シースリー代表の中村健作と申します。</p>
              <p>私は、地域環境整備活動、土地活用関連相談、盛土関連事業の調整、建設関連ネットワーク支援等に携わる一方、地域環境保全活動や災害支援活動にも取り組んでおります。</p>
              <p>私は、すべてを自社のみで行うのではなく、それぞれの分野に精通した専門事業者、地域関係者、関係機関と連携しながら、事業を形にしていく調整役として活動しております。</p>
              <p>東日本大震災をきっかけに、「地域のために出来ることを続けたい」という思いを持つようになりました。<br />現在は、不法投棄問題、環境問題、地域安全問題、土地管理の問題など、地域が抱える様々な課題に対し、地域住民の皆様、地主様、関係事業者の皆様と協力しながら活動を行っております。</p>
              <p>今後も、地域との対話を大切にし、安全性, 透明性、法令順守を重視した活動を続けて参ります。何卒宜しくお願い申し上げます。</p>
              <p className="pt-4 font-bold text-right">株式会社シースリー<br />代表取締役　中村健作</p>
            </div>
          </div>

        </div>
      </div>
    );
  };

  const CompanyPage = () => (
    <div className="animate-fadeIn pb-16">
      <PageHeader title="会社概要" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-10">
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <th className="py-4 px-6 bg-gray-50 text-gray-800 font-bold w-1/3 md:w-1/4">会社名</th>
                <td className="py-4 px-6 text-gray-700">株式会社シースリー</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <th className="py-4 px-6 bg-gray-50 text-gray-800 font-bold">代表者</th>
                <td className="py-4 px-6 text-gray-700">中村 健作</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <th className="py-4 px-6 bg-gray-50 text-gray-800 font-bold">所在地</th>
                <td className="py-4 px-6 text-gray-700">〒300-0026<br/>茨城県土浦市おおつ野8-3-6</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <th className="py-4 px-6 bg-gray-50 text-gray-800 font-bold">主な活動</th>
                <td className="py-4 px-6 text-gray-700">地域環境整備活動・土地活用関連相談・盛土関連事業調整・地域活動</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <th className="py-4 px-6 bg-gray-50 text-gray-800 font-bold">活動地域</th>
                <td className="py-4 px-6 text-gray-700">茨城県南地域・栃木県宇都宮市周辺</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <th className="py-4 px-6 bg-gray-50 text-gray-800 font-bold">理容室所在地</th>
                <td className="py-4 px-6 text-gray-700">茨城県土浦市神立町</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <th className="py-4 px-6 bg-gray-50 text-gray-800 font-bold">理容室名</th>
                <td className="py-4 px-6 text-gray-700">ヘアーサロンINA</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <th className="py-4 px-6 bg-gray-50 text-gray-800 font-bold">電話番号</th>
                <td className="py-4 px-6 text-gray-500 italic">（掲載予定）</td>
              </tr>
              <tr className="border-b border-gray-200 hover:bg-gray-50">
                <th className="py-4 px-6 bg-gray-50 text-gray-800 font-bold">メールアドレス</th>
                <td className="py-4 px-6 text-gray-500 italic">（掲載予定）</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <th className="py-4 px-6 bg-gray-50 text-gray-800 font-bold">SNS</th>
                <td className="py-4 px-6 text-gray-500 italic">（掲載予定）</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-gray-800 text-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-emerald-400 mb-3">連携対応について</h3>
          <p className="text-sm leading-relaxed text-gray-300">
            当社は, 相談内容に応じて、各分野の専門事業者及び関係機関と連携しながら対応しております。<br />
            不動産売買・仲介、建設工事、各種許認可申請、専門的施工等については、必要に応じて適任の有資格者、許可業者、専門事業者と連携して対応致します。
          </p>
        </div>

      </div>
    </div>
  );

  const ContactPage = () => (
    <div className="animate-fadeIn pb-16">
      <PageHeader title="お問い合わせ" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            地域環境整備、土地活用、盛土関連事業、建設関連ネットワーク、地域活動等に関するご相談を承っております。<br />
            内容に応じて、適任の専門事業者及び関係者と連携しながら対応致します。お気軽にお問い合わせ下さい。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-1 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-emerald-900 mb-4 border-b pb-2">主な相談内容</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>・地域環境整備に関する相談</li>
              <li>・土地活用関連相談</li>
              <li>・盛土関連事業の相談</li>
              <li>・地主様対応・地域説明に関する相談</li>
              <li>・建設関連事業者との連携相談</li>
              <li>・特殊車両運搬関連相談</li>
              <li>・不動産関連相談</li>
              <li>・地域活動相談</li>
              <li>・環境活動相談</li>
              <li>・不法投棄防止活動に関する相談</li>
              <li>・理容室に関するお問い合わせ</li>
              <li>・飲食店運営に関する相談</li>
            </ul>
          </div>

          <div className="md:col-span-2 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6">お問い合わせフォーム</h3>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">お名前 <span className="text-red-500">*</span></label>
                <input type="text" className="w-full border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border" placeholder="山田 太郎" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">会社名・団体名</label>
                <input type="text" className="w-full border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border" placeholder="株式会社〇〇" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ご住所</label>
                <input type="text" className="w-full border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                <input type="tel" className="w-full border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border" placeholder="090-1234-5678" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス <span className="text-red-500">*</span></label>
                <input type="email" className="w-full border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border" placeholder="example@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">お問い合わせ内容 <span className="text-red-500">*</span></label>
                <textarea rows="5" className="w-full border-gray-300 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2 border" placeholder="ご相談内容をご記入ください"></textarea>
              </div>
              <button type="submit" className="w-full bg-emerald-800 text-white font-bold py-3 px-4 rounded hover:bg-emerald-900 transition-colors">
                送信する
              </button>
            </form>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg text-amber-900">
          <h4 className="font-bold mb-2 flex items-center">
            <span className="text-xl mr-2">⚠️</span> お問い合わせ時の注意事項
          </h4>
          <p className="text-sm leading-relaxed mb-2">
            内容によっては, 当社から直接対応するだけでなく、適任の専門事業者、関係機関等をご紹介又は連携させて頂く場合がございます。
          </p>
          <p className="text-sm leading-relaxed font-bold">
            無理な営業、強引な契約、法令に反する対応等は行いません。地域との信頼関係、安全性、透明性を大切にしながら対応致します。
          </p>
        </div>

      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Header />
      
      <main className="flex-grow">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'business' && <BusinessPage />}
        {currentPage === 'activity' && <ActivityPage />}
        {currentPage === 'volunteer' && <VolunteerPage />}
        {currentPage === 'profile' && <ProfilePage />}
        {currentPage === 'company' && <CompanyPage />}
        {currentPage === 'contact' && <ContactPage />}
      </main>

      <Footer />
    </div>
  );
};

export default App;