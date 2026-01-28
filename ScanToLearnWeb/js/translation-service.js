/**
 * Translation Service for ScanToLearn
 * Comprehensive Japanese-English dictionary with caching
 */

class TranslationService {
    constructor() {
        // In-memory cache: key = "text_sourceLanguage_targetLanguage"
        this.cache = new Map();

        // Build comprehensive dictionary
        this.dictionary = this.buildDictionary();
    }

    /**
     * Build a comprehensive Japanese-English dictionary
     */
    buildDictionary() {
        const dict = {};

        // === HIRAGANA ===
        const hiragana = {
            'あ': { meaning: 'a', pos: 'hiragana', example: 'あい (ai) = love' },
            'い': { meaning: 'i', pos: 'hiragana', example: 'いえ (ie) = house' },
            'う': { meaning: 'u', pos: 'hiragana', example: 'うみ (umi) = sea' },
            'え': { meaning: 'e', pos: 'hiragana', example: 'えき (eki) = station' },
            'お': { meaning: 'o', pos: 'hiragana', example: 'おか (oka) = hill' },
            'か': { meaning: 'ka', pos: 'hiragana', example: 'かさ (kasa) = umbrella' },
            'き': { meaning: 'ki', pos: 'hiragana', example: 'きた (kita) = north' },
            'く': { meaning: 'ku', pos: 'hiragana', example: 'くも (kumo) = cloud' },
            'け': { meaning: 'ke', pos: 'hiragana', example: 'けむり (kemuri) = smoke' },
            'こ': { meaning: 'ko', pos: 'hiragana', example: 'こえ (koe) = voice' },
            'さ': { meaning: 'sa', pos: 'hiragana', example: 'さくら (sakura) = cherry blossom' },
            'し': { meaning: 'shi', pos: 'hiragana', example: 'しお (shio) = salt' },
            'す': { meaning: 'su', pos: 'hiragana', example: 'すし (sushi) = sushi' },
            'せ': { meaning: 'se', pos: 'hiragana', example: 'せかい (sekai) = world' },
            'そ': { meaning: 'so', pos: 'hiragana', example: 'そら (sora) = sky' },
            'た': { meaning: 'ta', pos: 'hiragana', example: 'たべる (taberu) = to eat' },
            'ち': { meaning: 'chi', pos: 'hiragana', example: 'ちず (chizu) = map' },
            'つ': { meaning: 'tsu', pos: 'hiragana', example: 'つき (tsuki) = moon' },
            'て': { meaning: 'te', pos: 'hiragana', example: 'てがみ (tegami) = letter' },
            'と': { meaning: 'to', pos: 'hiragana', example: 'とり (tori) = bird' },
            'な': { meaning: 'na', pos: 'hiragana', example: 'なつ (natsu) = summer' },
            'に': { meaning: 'ni', pos: 'hiragana', example: 'にく (niku) = meat' },
            'ぬ': { meaning: 'nu', pos: 'hiragana', example: 'ぬの (nuno) = cloth' },
            'ね': { meaning: 'ne', pos: 'hiragana', example: 'ねこ (neko) = cat' },
            'の': { meaning: 'no (possessive)', pos: 'particle', example: '私の本 (watashi no hon) = my book' },
            'は': { meaning: 'ha/wa (topic marker)', pos: 'particle', example: '私は学生です = I am a student' },
            'ひ': { meaning: 'hi', pos: 'hiragana', example: 'ひと (hito) = person' },
            'ふ': { meaning: 'fu', pos: 'hiragana', example: 'ふね (fune) = ship' },
            'へ': { meaning: 'he/e (direction)', pos: 'particle', example: '学校へ行く = go to school' },
            'ほ': { meaning: 'ho', pos: 'hiragana', example: 'ほん (hon) = book' },
            'ま': { meaning: 'ma', pos: 'hiragana', example: 'まち (machi) = town' },
            'み': { meaning: 'mi', pos: 'hiragana', example: 'みず (mizu) = water' },
            'む': { meaning: 'mu', pos: 'hiragana', example: 'むし (mushi) = insect' },
            'め': { meaning: 'me', pos: 'hiragana', example: 'め (me) = eye' },
            'も': { meaning: 'mo (also)', pos: 'particle', example: '私も = me too' },
            'や': { meaning: 'ya', pos: 'hiragana', example: 'やま (yama) = mountain' },
            'ゆ': { meaning: 'yu', pos: 'hiragana', example: 'ゆき (yuki) = snow' },
            'よ': { meaning: 'yo', pos: 'hiragana', example: 'よる (yoru) = night' },
            'ら': { meaning: 'ra', pos: 'hiragana', example: 'らいねん (rainen) = next year' },
            'り': { meaning: 'ri', pos: 'hiragana', example: 'りんご (ringo) = apple' },
            'る': { meaning: 'ru', pos: 'hiragana', example: 'verb ending' },
            'れ': { meaning: 're', pos: 'hiragana', example: 'れきし (rekishi) = history' },
            'ろ': { meaning: 'ro', pos: 'hiragana', example: 'ろく (roku) = six' },
            'わ': { meaning: 'wa', pos: 'hiragana', example: 'わたし (watashi) = I' },
            'を': { meaning: 'wo (object marker)', pos: 'particle', example: '本を読む = read a book' },
            'ん': { meaning: 'n', pos: 'hiragana', example: 'にほん (nihon) = Japan' },
            'が': { meaning: 'ga (subject marker)', pos: 'particle', example: '猫がいる = there is a cat' },
            'ぎ': { meaning: 'gi', pos: 'hiragana', example: 'ぎんこう (ginkou) = bank' },
            'ぐ': { meaning: 'gu', pos: 'hiragana', example: 'ぐん (gun) = army' },
            'げ': { meaning: 'ge', pos: 'hiragana', example: 'げんき (genki) = healthy' },
            'ご': { meaning: 'go', pos: 'hiragana', example: 'ごはん (gohan) = rice/meal' },
            'ざ': { meaning: 'za', pos: 'hiragana', example: 'ざっし (zasshi) = magazine' },
            'じ': { meaning: 'ji', pos: 'hiragana', example: 'じかん (jikan) = time' },
            'ず': { meaning: 'zu', pos: 'hiragana', example: 'ずつう (zutsuu) = headache' },
            'ぜ': { meaning: 'ze', pos: 'hiragana', example: 'ぜんぶ (zenbu) = all' },
            'ぞ': { meaning: 'zo', pos: 'hiragana', example: 'ぞう (zou) = elephant' },
            'だ': { meaning: 'da (is/copula)', pos: 'copula', example: '学生だ = is a student' },
            'ぢ': { meaning: 'ji', pos: 'hiragana', example: 'rare' },
            'づ': { meaning: 'zu', pos: 'hiragana', example: 'rare' },
            'で': { meaning: 'de (at/by/with)', pos: 'particle', example: '学校で勉強する = study at school' },
            'ど': { meaning: 'do', pos: 'hiragana', example: 'どこ (doko) = where' },
            'ば': { meaning: 'ba', pos: 'hiragana', example: 'ばしょ (basho) = place' },
            'び': { meaning: 'bi', pos: 'hiragana', example: 'びじゅつ (bijutsu) = art' },
            'ぶ': { meaning: 'bu', pos: 'hiragana', example: 'ぶんか (bunka) = culture' },
            'べ': { meaning: 'be', pos: 'hiragana', example: 'べんきょう (benkyou) = study' },
            'ぼ': { meaning: 'bo', pos: 'hiragana', example: 'ぼく (boku) = I (male)' },
            'ぱ': { meaning: 'pa', pos: 'hiragana', example: 'ぱん (pan) = bread' },
            'ぴ': { meaning: 'pi', pos: 'hiragana', example: 'ぴあの (piano) = piano' },
            'ぷ': { meaning: 'pu', pos: 'hiragana', example: 'ぷれぜんと (present)' },
            'ぺ': { meaning: 'pe', pos: 'hiragana', example: 'ぺん (pen) = pen' },
            'ぽ': { meaning: 'po', pos: 'hiragana', example: 'ぽけっと (pocket)' },
            'っ': { meaning: 'small tsu (doubles consonant)', pos: 'hiragana', example: 'がっこう (gakkou)' },
            'ゃ': { meaning: 'small ya', pos: 'hiragana', example: 'きゃ (kya)' },
            'ゅ': { meaning: 'small yu', pos: 'hiragana', example: 'きゅ (kyu)' },
            'ょ': { meaning: 'small yo', pos: 'hiragana', example: 'きょ (kyo)' },
            'いい': { meaning: 'good, fine', pos: 'adjective', example: 'いい天気ですね = nice weather' },
        };

        // === KATAKANA ===
        const katakana = {
            'ア': { meaning: 'a', pos: 'katakana', example: 'アメリカ (Amerika) = America' },
            'イ': { meaning: 'i', pos: 'katakana', example: 'イギリス (Igirisu) = England' },
            'ウ': { meaning: 'u', pos: 'katakana', example: 'ウイルス (uirusu) = virus' },
            'エ': { meaning: 'e', pos: 'katakana', example: 'エレベーター = elevator' },
            'オ': { meaning: 'o', pos: 'katakana', example: 'オレンジ = orange' },
            'カ': { meaning: 'ka', pos: 'katakana', example: 'カメラ = camera' },
            'キ': { meaning: 'ki', pos: 'katakana', example: 'キロ = kilo' },
            'ク': { meaning: 'ku', pos: 'katakana', example: 'クラス = class' },
            'ケ': { meaning: 'ke', pos: 'katakana', example: 'ケーキ = cake' },
            'コ': { meaning: 'ko', pos: 'katakana', example: 'コーヒー = coffee' },
            'サ': { meaning: 'sa', pos: 'katakana', example: 'サラダ = salad' },
            'シ': { meaning: 'shi', pos: 'katakana', example: 'シャツ = shirt' },
            'ス': { meaning: 'su', pos: 'katakana', example: 'スポーツ = sports' },
            'セ': { meaning: 'se', pos: 'katakana', example: 'セーター = sweater' },
            'ソ': { meaning: 'so', pos: 'katakana', example: 'ソファー = sofa' },
            'タ': { meaning: 'ta', pos: 'katakana', example: 'タクシー = taxi' },
            'チ': { meaning: 'chi', pos: 'katakana', example: 'チーズ = cheese' },
            'ツ': { meaning: 'tsu', pos: 'katakana', example: 'ツアー = tour' },
            'テ': { meaning: 'te', pos: 'katakana', example: 'テレビ = television' },
            'ト': { meaning: 'to', pos: 'katakana', example: 'トマト = tomato' },
            'ナ': { meaning: 'na', pos: 'katakana', example: 'ナイフ = knife' },
            'ニ': { meaning: 'ni', pos: 'katakana', example: 'ニュース = news' },
            'ヌ': { meaning: 'nu', pos: 'katakana', example: 'ヌードル = noodle' },
            'ネ': { meaning: 'ne', pos: 'katakana', example: 'ネクタイ = necktie' },
            'ノ': { meaning: 'no', pos: 'katakana', example: 'ノート = notebook' },
            'ハ': { meaning: 'ha', pos: 'katakana', example: 'ハンバーガー = hamburger' },
            'ヒ': { meaning: 'hi', pos: 'katakana', example: 'ヒーター = heater' },
            'フ': { meaning: 'fu', pos: 'katakana', example: 'フランス = France' },
            'ヘ': { meaning: 'he', pos: 'katakana', example: 'ヘリコプター = helicopter' },
            'ホ': { meaning: 'ho', pos: 'katakana', example: 'ホテル = hotel' },
            'マ': { meaning: 'ma', pos: 'katakana', example: 'マンション = apartment' },
            'ミ': { meaning: 'mi', pos: 'katakana', example: 'ミルク = milk' },
            'ム': { meaning: 'mu', pos: 'katakana', example: 'ムービー = movie' },
            'メ': { meaning: 'me', pos: 'katakana', example: 'メニュー = menu' },
            'モ': { meaning: 'mo', pos: 'katakana', example: 'モデル = model' },
            'ヤ': { meaning: 'ya', pos: 'katakana', example: 'ヤード = yard' },
            'ユ': { meaning: 'yu', pos: 'katakana', example: 'ユーザー = user' },
            'ヨ': { meaning: 'yo', pos: 'katakana', example: 'ヨーロッパ = Europe' },
            'ラ': { meaning: 'ra', pos: 'katakana', example: 'ラジオ = radio' },
            'リ': { meaning: 'ri', pos: 'katakana', example: 'リモコン = remote control' },
            'ル': { meaning: 'ru', pos: 'katakana', example: 'ルール = rule' },
            'レ': { meaning: 're', pos: 'katakana', example: 'レストラン = restaurant' },
            'ロ': { meaning: 'ro', pos: 'katakana', example: 'ロボット = robot' },
            'ワ': { meaning: 'wa', pos: 'katakana', example: 'ワイン = wine' },
            'ヲ': { meaning: 'wo', pos: 'katakana', example: 'rare in katakana' },
            'ン': { meaning: 'n', pos: 'katakana', example: 'パン (pan) = bread' },
            'ガ': { meaning: 'ga', pos: 'katakana', example: 'ガス = gas' },
            'ギ': { meaning: 'gi', pos: 'katakana', example: 'ギター = guitar' },
            'グ': { meaning: 'gu', pos: 'katakana', example: 'グラス = glass' },
            'ゲ': { meaning: 'ge', pos: 'katakana', example: 'ゲーム = game' },
            'ゴ': { meaning: 'go', pos: 'katakana', example: 'ゴルフ = golf' },
            'ザ': { meaning: 'za', pos: 'katakana', example: 'ザ (the)' },
            'ジ': { meaning: 'ji', pos: 'katakana', example: 'ジュース = juice' },
            'ズ': { meaning: 'zu', pos: 'katakana', example: 'ズボン = pants' },
            'ゼ': { meaning: 'ze', pos: 'katakana', example: 'ゼロ = zero' },
            'ゾ': { meaning: 'zo', pos: 'katakana', example: 'ゾーン = zone' },
            'ダ': { meaning: 'da', pos: 'katakana', example: 'ダンス = dance' },
            'ヂ': { meaning: 'ji', pos: 'katakana', example: 'rare' },
            'ヅ': { meaning: 'zu', pos: 'katakana', example: 'rare' },
            'デ': { meaning: 'de', pos: 'katakana', example: 'デパート = department store' },
            'ド': { meaning: 'do', pos: 'katakana', example: 'ドア = door' },
            'バ': { meaning: 'ba', pos: 'katakana', example: 'バス = bus' },
            'ビ': { meaning: 'bi', pos: 'katakana', example: 'ビール = beer' },
            'ブ': { meaning: 'bu', pos: 'katakana', example: 'ブログ = blog' },
            'ベ': { meaning: 'be', pos: 'katakana', example: 'ベッド = bed' },
            'ボ': { meaning: 'bo', pos: 'katakana', example: 'ボール = ball' },
            'パ': { meaning: 'pa', pos: 'katakana', example: 'パーティー = party' },
            'ピ': { meaning: 'pi', pos: 'katakana', example: 'ピアノ = piano' },
            'プ': { meaning: 'pu', pos: 'katakana', example: 'プール = pool' },
            'ペ': { meaning: 'pe', pos: 'katakana', example: 'ペン = pen' },
            'ポ': { meaning: 'po', pos: 'katakana', example: 'ポスト = post' },
            'ッ': { meaning: 'small tsu (doubles consonant)', pos: 'katakana', example: 'カップ (kappu)' },
            'ャ': { meaning: 'small ya', pos: 'katakana', example: 'キャ (kya)' },
            'ュ': { meaning: 'small yu', pos: 'katakana', example: 'キュ (kyu)' },
            'ョ': { meaning: 'small yo', pos: 'katakana', example: 'キョ (kyo)' },
            'ー': { meaning: 'long vowel mark', pos: 'katakana', example: 'コーヒー = coffee' },
            'ング': { meaning: '-ing (English suffix)', pos: 'suffix', example: 'ランニング = running' },
            'ンダ': { meaning: 'part of word', pos: 'katakana', example: 'パンダ = panda' },
        };

        // === COMMON KANJI ===
        const kanji = {
            // Numbers
            '一': { meaning: 'one, 1', pos: 'number', example: '一つ (hitotsu) = one thing' },
            '二': { meaning: 'two, 2', pos: 'number', example: '二人 (futari) = two people' },
            '三': { meaning: 'three, 3', pos: 'number', example: '三月 (sangatsu) = March' },
            '四': { meaning: 'four, 4', pos: 'number', example: '四月 (shigatsu) = April' },
            '五': { meaning: 'five, 5', pos: 'number', example: '五日 (itsuka) = 5th day' },
            '六': { meaning: 'six, 6', pos: 'number', example: '六月 (rokugatsu) = June' },
            '七': { meaning: 'seven, 7', pos: 'number', example: '七月 (shichigatsu) = July' },
            '八': { meaning: 'eight, 8', pos: 'number', example: '八百 (happyaku) = 800' },
            '九': { meaning: 'nine, 9', pos: 'number', example: '九月 (kugatsu) = September' },
            '十': { meaning: 'ten, 10', pos: 'number', example: '十分 (juppun) = 10 minutes' },
            '百': { meaning: 'hundred, 100', pos: 'number', example: '百円 = 100 yen' },
            '千': { meaning: 'thousand, 1000', pos: 'number', example: '千円 = 1000 yen' },
            '万': { meaning: 'ten thousand, 10000', pos: 'number', example: '一万円 = 10000 yen' },

            // People & Body
            '人': { meaning: 'person, people', pos: 'noun', example: '日本人 (nihonjin) = Japanese person' },
            '女': { meaning: 'woman, female', pos: 'noun', example: '女の子 = girl' },
            '男': { meaning: 'man, male', pos: 'noun', example: '男の子 = boy' },
            '子': { meaning: 'child, kid', pos: 'noun', example: '子供 (kodomo) = children' },
            '目': { meaning: 'eye', pos: 'noun', example: '目が大きい = big eyes' },
            '口': { meaning: 'mouth', pos: 'noun', example: '口を開ける = open mouth' },
            '手': { meaning: 'hand', pos: 'noun', example: '手を洗う = wash hands' },
            '足': { meaning: 'foot, leg', pos: 'noun', example: '足が痛い = leg hurts' },
            '耳': { meaning: 'ear', pos: 'noun', example: '耳が大きい = big ears' },
            '心': { meaning: 'heart, mind', pos: 'noun', example: '心配 (shinpai) = worry' },
            '体': { meaning: 'body', pos: 'noun', example: '体が丈夫 = healthy body' },

            // Nature
            '日': { meaning: 'day, sun', pos: 'noun', example: '日曜日 = Sunday' },
            '月': { meaning: 'month, moon', pos: 'noun', example: '月曜日 = Monday' },
            '火': { meaning: 'fire', pos: 'noun', example: '火曜日 = Tuesday' },
            '水': { meaning: 'water', pos: 'noun', example: '水曜日 = Wednesday' },
            '木': { meaning: 'tree, wood', pos: 'noun', example: '木曜日 = Thursday' },
            '金': { meaning: 'gold, money', pos: 'noun', example: '金曜日 = Friday' },
            '土': { meaning: 'earth, soil', pos: 'noun', example: '土曜日 = Saturday' },
            '山': { meaning: 'mountain', pos: 'noun', example: '富士山 = Mt. Fuji' },
            '川': { meaning: 'river', pos: 'noun', example: '川を渡る = cross the river' },
            '海': { meaning: 'sea, ocean', pos: 'noun', example: '海が好き = like the sea' },
            '空': { meaning: 'sky', pos: 'noun', example: '空が青い = sky is blue' },
            '花': { meaning: 'flower', pos: 'noun', example: '花が咲く = flower blooms' },
            '雨': { meaning: 'rain', pos: 'noun', example: '雨が降る = it rains' },
            '雪': { meaning: 'snow', pos: 'noun', example: '雪が降る = it snows' },
            '風': { meaning: 'wind', pos: 'noun', example: '風が強い = strong wind' },
            '天': { meaning: 'heaven, sky', pos: 'noun', example: '天気 = weather' },
            '地': { meaning: 'earth, ground', pos: 'noun', example: '地図 = map' },

            // Time
            '年': { meaning: 'year', pos: 'noun', example: '今年 = this year' },
            '時': { meaning: 'time, hour', pos: 'noun', example: '三時 = 3 o\'clock' },
            '分': { meaning: 'minute, part', pos: 'noun', example: '十分 = 10 minutes' },
            '秒': { meaning: 'second', pos: 'noun', example: '三秒 = 3 seconds' },
            '今': { meaning: 'now', pos: 'noun', example: '今日 = today' },
            '前': { meaning: 'before, front', pos: 'noun', example: '午前 = morning (AM)' },
            '後': { meaning: 'after, behind', pos: 'noun', example: '午後 = afternoon (PM)' },
            '朝': { meaning: 'morning', pos: 'noun', example: '朝ご飯 = breakfast' },
            '昼': { meaning: 'noon, daytime', pos: 'noun', example: '昼ご飯 = lunch' },
            '夜': { meaning: 'night', pos: 'noun', example: '夜ご飯 = dinner' },
            '週': { meaning: 'week', pos: 'noun', example: '今週 = this week' },

            // Places
            '国': { meaning: 'country', pos: 'noun', example: '日本国 = Japan' },
            '東': { meaning: 'east', pos: 'noun', example: '東京 = Tokyo' },
            '西': { meaning: 'west', pos: 'noun', example: '西口 = west exit' },
            '南': { meaning: 'south', pos: 'noun', example: '南口 = south exit' },
            '北': { meaning: 'north', pos: 'noun', example: '北海道 = Hokkaido' },
            '京': { meaning: 'capital', pos: 'noun', example: '東京 = Tokyo' },
            '店': { meaning: 'shop, store', pos: 'noun', example: '本屋 = bookstore' },
            '駅': { meaning: 'station', pos: 'noun', example: '東京駅 = Tokyo Station' },
            '家': { meaning: 'house, home', pos: 'noun', example: '家に帰る = go home' },
            '室': { meaning: 'room', pos: 'noun', example: '教室 = classroom' },
            '校': { meaning: 'school', pos: 'noun', example: '学校 = school' },
            '会': { meaning: 'meeting, society', pos: 'noun', example: '会社 = company' },
            '社': { meaning: 'company, shrine', pos: 'noun', example: '神社 = shrine' },
            '場': { meaning: 'place', pos: 'noun', example: '駐車場 = parking lot' },
            '道': { meaning: 'road, way', pos: 'noun', example: '道を歩く = walk the road' },
            '町': { meaning: 'town', pos: 'noun', example: '町を歩く = walk around town' },
            '市': { meaning: 'city', pos: 'noun', example: '東京市 = Tokyo city' },
            '区': { meaning: 'ward, district', pos: 'noun', example: '渋谷区 = Shibuya ward' },

            // Actions
            '見': { meaning: 'see, look', pos: 'verb stem', example: '見る = to see' },
            '聞': { meaning: 'hear, listen', pos: 'verb stem', example: '聞く = to listen' },
            '言': { meaning: 'say, speak', pos: 'verb stem', example: '言う = to say' },
            '話': { meaning: 'speak, talk', pos: 'verb stem', example: '話す = to speak' },
            '読': { meaning: 'read', pos: 'verb stem', example: '読む = to read' },
            '書': { meaning: 'write', pos: 'verb stem', example: '書く = to write' },
            '食': { meaning: 'eat', pos: 'verb stem', example: '食べる = to eat' },
            '飲': { meaning: 'drink', pos: 'verb stem', example: '飲む = to drink' },
            '行': { meaning: 'go', pos: 'verb stem', example: '行く = to go' },
            '来': { meaning: 'come', pos: 'verb stem', example: '来る = to come' },
            '帰': { meaning: 'return', pos: 'verb stem', example: '帰る = to return' },
            '入': { meaning: 'enter', pos: 'verb stem', example: '入る = to enter' },
            '出': { meaning: 'exit, put out', pos: 'verb stem', example: '出る = to exit' },
            '買': { meaning: 'buy', pos: 'verb stem', example: '買う = to buy' },
            '売': { meaning: 'sell', pos: 'verb stem', example: '売る = to sell' },
            '作': { meaning: 'make, create', pos: 'verb stem', example: '作る = to make' },
            '使': { meaning: 'use', pos: 'verb stem', example: '使う = to use' },
            '持': { meaning: 'hold, have', pos: 'verb stem', example: '持つ = to hold' },
            '待': { meaning: 'wait', pos: 'verb stem', example: '待つ = to wait' },
            '立': { meaning: 'stand', pos: 'verb stem', example: '立つ = to stand' },
            '座': { meaning: 'sit', pos: 'verb stem', example: '座る = to sit' },
            '走': { meaning: 'run', pos: 'verb stem', example: '走る = to run' },
            '歩': { meaning: 'walk', pos: 'verb stem', example: '歩く = to walk' },
            '泳': { meaning: 'swim', pos: 'verb stem', example: '泳ぐ = to swim' },
            '寝': { meaning: 'sleep', pos: 'verb stem', example: '寝る = to sleep' },
            '起': { meaning: 'wake up', pos: 'verb stem', example: '起きる = to wake up' },
            '開': { meaning: 'open', pos: 'verb stem', example: '開ける = to open' },
            '閉': { meaning: 'close', pos: 'verb stem', example: '閉める = to close' },
            '始': { meaning: 'begin', pos: 'verb stem', example: '始める = to begin' },
            '終': { meaning: 'end', pos: 'verb stem', example: '終わる = to end' },
            '教': { meaning: 'teach', pos: 'verb stem', example: '教える = to teach' },
            '学': { meaning: 'learn, study', pos: 'verb stem', example: '学ぶ = to learn' },
            '習': { meaning: 'learn, practice', pos: 'verb stem', example: '習う = to learn' },
            '働': { meaning: 'work', pos: 'verb stem', example: '働く = to work' },
            '休': { meaning: 'rest', pos: 'verb stem', example: '休む = to rest' },
            '遊': { meaning: 'play', pos: 'verb stem', example: '遊ぶ = to play' },
            '思': { meaning: 'think', pos: 'verb stem', example: '思う = to think' },
            '知': { meaning: 'know', pos: 'verb stem', example: '知る = to know' },
            '分': { meaning: 'understand', pos: 'verb stem', example: '分かる = to understand' },
            '会': { meaning: 'meet', pos: 'verb stem', example: '会う = to meet' },
            '送': { meaning: 'send', pos: 'verb stem', example: '送る = to send' },
            '届': { meaning: 'deliver', pos: 'verb stem', example: '届く = to arrive' },
            '受': { meaning: 'receive', pos: 'verb stem', example: '受ける = to receive' },
            '取': { meaning: 'take', pos: 'verb stem', example: '取る = to take' },
            '乗': { meaning: 'ride', pos: 'verb stem', example: '乗る = to ride' },
            '降': { meaning: 'get off, fall', pos: 'verb stem', example: '降りる = to get off' },
            '着': { meaning: 'arrive, wear', pos: 'verb stem', example: '着く = to arrive' },
            '払': { meaning: 'pay', pos: 'verb stem', example: '払う = to pay' },
            '借': { meaning: 'borrow', pos: 'verb stem', example: '借りる = to borrow' },
            '貸': { meaning: 'lend', pos: 'verb stem', example: '貸す = to lend' },
            '返': { meaning: 'return (something)', pos: 'verb stem', example: '返す = to return' },
            '変': { meaning: 'change', pos: 'verb stem', example: '変わる = to change' },
            '決': { meaning: 'decide', pos: 'verb stem', example: '決める = to decide' },
            '選': { meaning: 'choose', pos: 'verb stem', example: '選ぶ = to choose' },
            '答': { meaning: 'answer', pos: 'verb stem', example: '答える = to answer' },
            '質': { meaning: 'quality, question', pos: 'noun', example: '質問 = question' },
            '問': { meaning: 'question', pos: 'noun', example: '問題 = problem' },
            '試': { meaning: 'try, test', pos: 'verb stem', example: '試す = to try' },
            '験': { meaning: 'test, experience', pos: 'noun', example: '試験 = exam' },
            '練': { meaning: 'practice', pos: 'verb stem', example: '練習 = practice' },
            '勉': { meaning: 'study, endeavor', pos: 'verb stem', example: '勉強 = study' },
            '強': { meaning: 'strong', pos: 'adjective', example: '強い = strong' },

            // Adjectives/Descriptions
            '大': { meaning: 'big, large', pos: 'adjective', example: '大きい = big' },
            '小': { meaning: 'small', pos: 'adjective', example: '小さい = small' },
            '多': { meaning: 'many, much', pos: 'adjective', example: '多い = many' },
            '少': { meaning: 'few, little', pos: 'adjective', example: '少ない = few' },
            '長': { meaning: 'long', pos: 'adjective', example: '長い = long' },
            '短': { meaning: 'short', pos: 'adjective', example: '短い = short' },
            '高': { meaning: 'high, expensive', pos: 'adjective', example: '高い = expensive' },
            '安': { meaning: 'cheap, safe', pos: 'adjective', example: '安い = cheap' },
            '低': { meaning: 'low', pos: 'adjective', example: '低い = low' },
            '新': { meaning: 'new', pos: 'adjective', example: '新しい = new' },
            '古': { meaning: 'old', pos: 'adjective', example: '古い = old' },
            '若': { meaning: 'young', pos: 'adjective', example: '若い = young' },
            '早': { meaning: 'early, fast', pos: 'adjective', example: '早い = early' },
            '遅': { meaning: 'late, slow', pos: 'adjective', example: '遅い = late' },
            '速': { meaning: 'fast, quick', pos: 'adjective', example: '速い = fast' },
            '近': { meaning: 'near', pos: 'adjective', example: '近い = near' },
            '遠': { meaning: 'far', pos: 'adjective', example: '遠い = far' },
            '広': { meaning: 'wide, spacious', pos: 'adjective', example: '広い = wide' },
            '狭': { meaning: 'narrow', pos: 'adjective', example: '狭い = narrow' },
            '明': { meaning: 'bright', pos: 'adjective', example: '明るい = bright' },
            '暗': { meaning: 'dark', pos: 'adjective', example: '暗い = dark' },
            '熱': { meaning: 'hot (things)', pos: 'adjective', example: '熱い = hot' },
            '冷': { meaning: 'cold', pos: 'adjective', example: '冷たい = cold' },
            '暑': { meaning: 'hot (weather)', pos: 'adjective', example: '暑い = hot' },
            '寒': { meaning: 'cold (weather)', pos: 'adjective', example: '寒い = cold' },
            '良': { meaning: 'good', pos: 'adjective', example: '良い = good' },
            '悪': { meaning: 'bad', pos: 'adjective', example: '悪い = bad' },
            '正': { meaning: 'correct', pos: 'adjective', example: '正しい = correct' },
            '美': { meaning: 'beautiful', pos: 'adjective', example: '美しい = beautiful' },
            '忙': { meaning: 'busy', pos: 'adjective', example: '忙しい = busy' },
            '易': { meaning: 'easy', pos: 'adjective', example: '易しい = easy' },
            '難': { meaning: 'difficult', pos: 'adjective', example: '難しい = difficult' },
            '楽': { meaning: 'fun, easy', pos: 'adjective', example: '楽しい = fun' },
            '苦': { meaning: 'bitter, painful', pos: 'adjective', example: '苦い = bitter' },
            '辛': { meaning: 'spicy, hard', pos: 'adjective', example: '辛い = spicy' },
            '甘': { meaning: 'sweet', pos: 'adjective', example: '甘い = sweet' },
            '重': { meaning: 'heavy', pos: 'adjective', example: '重い = heavy' },
            '軽': { meaning: 'light (weight)', pos: 'adjective', example: '軽い = light' },
            '静': { meaning: 'quiet', pos: 'adjective', example: '静かな = quiet' },
            '元': { meaning: 'origin, healthy', pos: 'noun', example: '元気 = healthy' },
            '気': { meaning: 'spirit, mind', pos: 'noun', example: '天気 = weather' },
            '有': { meaning: 'exist, have', pos: 'verb stem', example: '有名 = famous' },
            '名': { meaning: 'name', pos: 'noun', example: '名前 = name' },
            '同': { meaning: 'same', pos: 'adjective', example: '同じ = same' },
            '違': { meaning: 'different', pos: 'adjective', example: '違う = different' },
            '特': { meaning: 'special', pos: 'adjective', example: '特別 = special' },
            '別': { meaning: 'separate, another', pos: 'adjective', example: '別の = another' },
            '全': { meaning: 'all, whole', pos: 'adjective', example: '全部 = everything' },
            '部': { meaning: 'part, section', pos: 'noun', example: '部屋 = room' },
            '半': { meaning: 'half', pos: 'noun', example: '半分 = half' },

            // Objects/Things
            '物': { meaning: 'thing', pos: 'noun', example: '食べ物 = food' },
            '事': { meaning: 'thing, matter', pos: 'noun', example: '仕事 = work' },
            '本': { meaning: 'book', pos: 'noun', example: '本を読む = read a book' },
            '紙': { meaning: 'paper', pos: 'noun', example: '紙を使う = use paper' },
            '車': { meaning: 'car', pos: 'noun', example: '車に乗る = ride a car' },
            '電': { meaning: 'electricity', pos: 'noun', example: '電車 = train' },
            '話': { meaning: 'talk, story', pos: 'noun', example: '電話 = telephone' },
            '機': { meaning: 'machine', pos: 'noun', example: '飛行機 = airplane' },
            '品': { meaning: 'goods, item', pos: 'noun', example: '食品 = food product' },
            '料': { meaning: 'fee, material', pos: 'noun', example: '料理 = cooking' },
            '理': { meaning: 'reason, logic', pos: 'noun', example: '理由 = reason' },
            '由': { meaning: 'reason, cause', pos: 'noun', example: '自由 = freedom' },
            '自': { meaning: 'self', pos: 'noun', example: '自分 = oneself' },
            '他': { meaning: 'other', pos: 'noun', example: '他人 = other person' },
            '者': { meaning: 'person (formal)', pos: 'noun', example: '医者 = doctor' },
            '医': { meaning: 'medicine', pos: 'noun', example: '医者 = doctor' },
            '薬': { meaning: 'medicine, drug', pos: 'noun', example: '薬を飲む = take medicine' },
            '病': { meaning: 'illness', pos: 'noun', example: '病気 = sickness' },
            '院': { meaning: 'institution', pos: 'noun', example: '病院 = hospital' },
            '銀': { meaning: 'silver', pos: 'noun', example: '銀行 = bank' },
            '円': { meaning: 'yen, circle', pos: 'noun', example: '百円 = 100 yen' },
            '画': { meaning: 'picture', pos: 'noun', example: '映画 = movie' },
            '映': { meaning: 'reflect, project', pos: 'verb stem', example: '映画 = movie' },
            '音': { meaning: 'sound', pos: 'noun', example: '音楽 = music' },
            '色': { meaning: 'color', pos: 'noun', example: '色々 = various' },
            '白': { meaning: 'white', pos: 'adjective', example: '白い = white' },
            '黒': { meaning: 'black', pos: 'adjective', example: '黒い = black' },
            '赤': { meaning: 'red', pos: 'adjective', example: '赤い = red' },
            '青': { meaning: 'blue/green', pos: 'adjective', example: '青い = blue' },
            '黄': { meaning: 'yellow', pos: 'adjective', example: '黄色い = yellow' },
            '緑': { meaning: 'green', pos: 'noun', example: '緑色 = green color' },
            '茶': { meaning: 'tea, brown', pos: 'noun', example: 'お茶 = tea' },
            '酒': { meaning: 'alcohol, sake', pos: 'noun', example: 'お酒 = alcohol' },
            '肉': { meaning: 'meat', pos: 'noun', example: '牛肉 = beef' },
            '魚': { meaning: 'fish', pos: 'noun', example: '魚を食べる = eat fish' },
            '米': { meaning: 'rice', pos: 'noun', example: 'お米 = rice' },
            '野': { meaning: 'field, wild', pos: 'noun', example: '野菜 = vegetables' },
            '菜': { meaning: 'vegetable', pos: 'noun', example: '野菜 = vegetables' },
            '果': { meaning: 'fruit, result', pos: 'noun', example: '果物 = fruit' },
            '飯': { meaning: 'rice, meal', pos: 'noun', example: 'ご飯 = rice/meal' },
            '牛': { meaning: 'cow', pos: 'noun', example: '牛肉 = beef' },
            '豚': { meaning: 'pig', pos: 'noun', example: '豚肉 = pork' },
            '鳥': { meaning: 'bird', pos: 'noun', example: '鳥肉 = chicken' },
            '卵': { meaning: 'egg', pos: 'noun', example: '卵を食べる = eat eggs' },
            '犬': { meaning: 'dog', pos: 'noun', example: '犬が好き = like dogs' },
            '猫': { meaning: 'cat', pos: 'noun', example: '猫が好き = like cats' },

            // More concepts
            '力': { meaning: 'power, strength', pos: 'noun', example: '力がある = have power' },
            '方': { meaning: 'direction, person', pos: 'noun', example: '作り方 = how to make' },
            '法': { meaning: 'law, method', pos: 'noun', example: '方法 = method' },
            '度': { meaning: 'degree, time', pos: 'noun', example: '今度 = next time' },
            '回': { meaning: 'counter for times', pos: 'counter', example: '三回 = three times' },
            '番': { meaning: 'number, turn', pos: 'noun', example: '一番 = number one' },
            '号': { meaning: 'number, issue', pos: 'noun', example: '電話番号 = phone number' },
            '代': { meaning: 'generation, fee', pos: 'noun', example: '電気代 = electricity bill' },
            '台': { meaning: 'stand, counter', pos: 'noun', example: '一台 = one (machine)' },
            '世': { meaning: 'world, generation', pos: 'noun', example: '世界 = world' },
            '界': { meaning: 'world, boundary', pos: 'noun', example: '世界 = world' },
            '内': { meaning: 'inside', pos: 'noun', example: '国内 = domestic' },
            '外': { meaning: 'outside', pos: 'noun', example: '外国 = foreign country' },
            '中': { meaning: 'middle, inside', pos: 'noun', example: '中国 = China' },
            '上': { meaning: 'up, above', pos: 'noun', example: '上手 = skilled' },
            '下': { meaning: 'down, below', pos: 'noun', example: '下手 = unskilled' },
            '右': { meaning: 'right', pos: 'noun', example: '右側 = right side' },
            '左': { meaning: 'left', pos: 'noun', example: '左側 = left side' },
            '先': { meaning: 'ahead, previous', pos: 'noun', example: '先生 = teacher' },
            '生': { meaning: 'life, birth', pos: 'noun', example: '学生 = student' },
            '死': { meaning: 'death', pos: 'noun', example: '死ぬ = to die' },
            '活': { meaning: 'life, activity', pos: 'noun', example: '生活 = life' },
            '動': { meaning: 'move', pos: 'verb stem', example: '動く = to move' },
            '止': { meaning: 'stop', pos: 'verb stem', example: '止まる = to stop' },
            '信': { meaning: 'trust, believe', pos: 'verb stem', example: '信じる = to believe' },
            '愛': { meaning: 'love', pos: 'noun', example: '愛している = I love you' },
            '好': { meaning: 'like', pos: 'adjective', example: '好き = like' },
            '嫌': { meaning: 'dislike', pos: 'adjective', example: '嫌い = dislike' },
            '怒': { meaning: 'anger', pos: 'verb stem', example: '怒る = get angry' },
            '笑': { meaning: 'laugh, smile', pos: 'verb stem', example: '笑う = to laugh' },
            '泣': { meaning: 'cry', pos: 'verb stem', example: '泣く = to cry' },
            '感': { meaning: 'feeling', pos: 'noun', example: '感じる = to feel' },
            '想': { meaning: 'thought', pos: 'noun', example: '想像 = imagination' },
            '考': { meaning: 'think', pos: 'verb stem', example: '考える = to think' },
            '意': { meaning: 'meaning, intention', pos: 'noun', example: '意味 = meaning' },
            '味': { meaning: 'taste', pos: 'noun', example: '意味 = meaning' },
            '記': { meaning: 'record', pos: 'verb stem', example: '記録 = record' },
            '録': { meaning: 'record', pos: 'noun', example: '記録 = record' },
            '議': { meaning: 'discussion', pos: 'noun', example: '会議 = meeting' },
            '請': { meaning: 'request, ask', pos: 'verb stem', example: '申請 = application' },
            '導': { meaning: 'guide, lead', pos: 'verb stem', example: '指導 = guidance' },
            '報': { meaning: 'report', pos: 'noun', example: '情報 = information' },
            '情': { meaning: 'emotion, info', pos: 'noun', example: '情報 = information' },

            // Common compounds
            '日本': { meaning: 'Japan', pos: 'noun', example: '日本語 = Japanese language' },
            '東京': { meaning: 'Tokyo', pos: 'noun', example: '東京に住む = live in Tokyo' },
            '今日': { meaning: 'today', pos: 'noun', example: '今日は暑い = today is hot' },
            '明日': { meaning: 'tomorrow', pos: 'noun', example: '明日会おう = let\'s meet tomorrow' },
            '昨日': { meaning: 'yesterday', pos: 'noun', example: '昨日行った = went yesterday' },
            '学校': { meaning: 'school', pos: 'noun', example: '学校に行く = go to school' },
            '先生': { meaning: 'teacher', pos: 'noun', example: '先生に聞く = ask the teacher' },
            '学生': { meaning: 'student', pos: 'noun', example: '大学生 = college student' },
            '仕事': { meaning: 'work, job', pos: 'noun', example: '仕事をする = to work' },
            '電車': { meaning: 'train', pos: 'noun', example: '電車に乗る = ride the train' },
            '電話': { meaning: 'telephone', pos: 'noun', example: '電話をかける = make a call' },
            '大学': { meaning: 'university', pos: 'noun', example: '大学に通う = attend university' },
            '会社': { meaning: 'company', pos: 'noun', example: '会社で働く = work at company' },
            '病院': { meaning: 'hospital', pos: 'noun', example: '病院に行く = go to hospital' },
            '銀行': { meaning: 'bank', pos: 'noun', example: '銀行でお金を借りる = borrow from bank' },
            '映画': { meaning: 'movie', pos: 'noun', example: '映画を見る = watch a movie' },
            '音楽': { meaning: 'music', pos: 'noun', example: '音楽を聞く = listen to music' },
            '天気': { meaning: 'weather', pos: 'noun', example: '天気がいい = good weather' },
            '料理': { meaning: 'cooking, dish', pos: 'noun', example: '料理を作る = cook' },
            '勉強': { meaning: 'study', pos: 'noun', example: '勉強する = to study' },
            '練習': { meaning: 'practice', pos: 'noun', example: '練習する = to practice' },
            '質問': { meaning: 'question', pos: 'noun', example: '質問がある = have a question' },
            '問題': { meaning: 'problem', pos: 'noun', example: '問題がある = have a problem' },
            '試験': { meaning: 'exam', pos: 'noun', example: '試験を受ける = take an exam' },
            '意味': { meaning: 'meaning', pos: 'noun', example: '意味が分からない = don\'t understand' },
            '友達': { meaning: 'friend', pos: 'noun', example: '友達と遊ぶ = play with friends' },
            '家族': { meaning: 'family', pos: 'noun', example: '家族と住む = live with family' },
            '両親': { meaning: 'parents', pos: 'noun', example: '両親に会う = meet parents' },
            '彼女': { meaning: 'she, girlfriend', pos: 'pronoun', example: '彼女は学生です = she is a student' },
            '彼氏': { meaning: 'boyfriend', pos: 'noun', example: '彼氏がいる = have a boyfriend' },
            '最近': { meaning: 'recently', pos: 'adverb', example: '最近忙しい = busy recently' },
            '本当': { meaning: 'really, true', pos: 'adverb', example: '本当に? = really?' },
            '大丈夫': { meaning: 'okay, alright', pos: 'adjective', example: '大丈夫です = I\'m okay' },
            '元気': { meaning: 'healthy, energetic', pos: 'adjective', example: '元気ですか = how are you' },
            '上手': { meaning: 'skilled, good at', pos: 'adjective', example: '日本語が上手 = good at Japanese' },
            '下手': { meaning: 'unskilled', pos: 'adjective', example: '料理が下手 = bad at cooking' },
            '有名': { meaning: 'famous', pos: 'adjective', example: '有名な人 = famous person' },
            '便利': { meaning: 'convenient', pos: 'adjective', example: '便利な場所 = convenient place' },
            '危険': { meaning: 'dangerous', pos: 'adjective', example: '危険な場所 = dangerous place' },
            '安全': { meaning: 'safe', pos: 'adjective', example: '安全な場所 = safe place' },
            '簡単': { meaning: 'easy, simple', pos: 'adjective', example: '簡単な問題 = easy problem' },
            '複雑': { meaning: 'complicated', pos: 'adjective', example: '複雑な問題 = complicated problem' },
            '綺麗': { meaning: 'beautiful, clean', pos: 'adjective', example: '綺麗な花 = beautiful flower' },
            '面白': { meaning: 'interesting, funny', pos: 'adjective', example: '面白い映画 = interesting movie' },
        };

        // Merge all dictionaries
        Object.assign(dict, hiragana, katakana, kanji);

        // Add common English words
        const english = {
            'Hello': { meaning: 'こんにちは', pos: 'interjection', example: 'Hello, how are you?' },
            'World': { meaning: '世界', pos: 'noun', example: 'The world is beautiful.' },
            'Book': { meaning: '本', pos: 'noun', example: 'I read a book.' },
            'Learn': { meaning: '学ぶ', pos: 'verb', example: 'I learn Japanese.' },
            'Thank': { meaning: '感謝する', pos: 'verb', example: 'Thank you.' },
            'you': { meaning: 'あなた', pos: 'pronoun', example: 'You are kind.' },
            'The': { meaning: 'その', pos: 'article', example: 'The cat.' },
            'is': { meaning: 'です', pos: 'verb', example: 'This is my book.' },
            'a': { meaning: '一つの', pos: 'article', example: 'A dog.' },
            'and': { meaning: 'と', pos: 'conjunction', example: 'Cat and dog.' },
            'to': { meaning: '〜へ', pos: 'preposition', example: 'Go to school.' },
            'of': { meaning: '〜の', pos: 'preposition', example: 'Cup of tea.' },
            'in': { meaning: '〜の中に', pos: 'preposition', example: 'In the box.' },
            'for': { meaning: '〜のために', pos: 'preposition', example: 'For you.' },
            'on': { meaning: '〜の上に', pos: 'preposition', example: 'On the table.' },
        };

        Object.assign(dict, english);

        return dict;
    }

    /**
     * Generate a cache key for a translation request
     */
    getCacheKey(text, sourceLanguage, targetLanguage) {
        return `${text}_${sourceLanguage}_${targetLanguage}`;
    }

    /**
     * Translate a single word/phrase
     */
    async translate(text, sourceLanguage, targetLanguage) {
        const cacheKey = this.getCacheKey(text, sourceLanguage, targetLanguage);

        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Simulate async operation
        await this.delay(10);

        // Check for dictionary entry
        const entry = this.dictionary[text];

        let result;
        if (entry) {
            result = {
                originalText: text,
                translatedText: entry.meaning,
                meaning: entry.meaning,
                partOfSpeech: entry.pos,
                exampleSentence: entry.example
            };
        } else {
            // Try to provide helpful info for unknown characters
            const charInfo = this.analyzeUnknownText(text);
            result = {
                originalText: text,
                translatedText: charInfo.translation,
                meaning: charInfo.meaning,
                partOfSpeech: charInfo.type,
                exampleSentence: charInfo.hint
            };
        }

        // Cache the result
        this.cache.set(cacheKey, result);

        return result;
    }

    /**
     * Analyze unknown text and provide helpful information
     */
    analyzeUnknownText(text) {
        // Check if it's a number
        if (/^[0-9]+$/.test(text)) {
            return {
                translation: text,
                meaning: `number: ${text}`,
                type: 'number',
                hint: 'Arabic numeral'
            };
        }

        // Check character type
        const hasHiragana = /[\u3040-\u309F]/.test(text);
        const hasKatakana = /[\u30A0-\u30FF]/.test(text);
        const hasKanji = /[\u4E00-\u9FAF]/.test(text);
        const hasRomaji = /[a-zA-Z]/.test(text);

        let type = 'unknown';
        let hint = 'Word not in dictionary';

        if (hasKanji && !hasHiragana && !hasKatakana) {
            type = 'kanji';
            hint = 'Kanji character(s) - try looking up individual characters';
        } else if (hasHiragana && !hasKanji) {
            type = 'hiragana';
            hint = 'Hiragana word - native Japanese word or grammar';
        } else if (hasKatakana && !hasKanji) {
            type = 'katakana';
            hint = 'Katakana word - likely foreign loanword';
        } else if (hasKanji && (hasHiragana || hasKatakana)) {
            type = 'compound';
            hint = 'Kanji with kana - verb, adjective, or compound word';
        } else if (hasRomaji) {
            type = 'romaji';
            hint = 'Roman letters';
        }

        return {
            translation: `[${type}] ${text}`,
            meaning: `(not in dictionary)`,
            type: type,
            hint: hint
        };
    }

    /**
     * Translate multiple texts (batch operation)
     */
    async translateBatch(texts, sourceLanguage, targetLanguage) {
        const results = [];
        for (const text of texts) {
            const result = await this.translate(text, sourceLanguage, targetLanguage);
            results.push(result);
        }
        return results;
    }

    /**
     * Get short language code for display
     */
    getLanguageShortCode(langCode) {
        const codes = {
            'jpn': 'JA',
            'eng': 'EN',
            'spa': 'ES',
            'fra': 'FR',
            'deu': 'DE',
            'chi_sim': 'ZH',
            'kor': 'KO'
        };
        return codes[langCode] || langCode.toUpperCase().slice(0, 2);
    }

    /**
     * Clear the translation cache
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get current cache size
     */
    getCacheSize() {
        return this.cache.size;
    }

    /**
     * Get dictionary size
     */
    getDictionarySize() {
        return Object.keys(this.dictionary).length;
    }

    /**
     * Helper to simulate async delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other modules
window.TranslationService = TranslationService;
