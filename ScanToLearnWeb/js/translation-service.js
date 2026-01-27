/**
 * Translation Service for ScanToLearn
 * Provides stub translations with in-memory caching
 */

class TranslationService {
    constructor() {
        // In-memory cache: key = "text_sourceLanguage_targetLanguage"
        this.cache = new Map();

        // Sample translations for demo purposes
        this.sampleTranslations = {
            // Japanese to English
            'こんにちは': { meaning: 'Hello', pos: 'interjection', example: 'こんにちは、元気ですか? (Hello, how are you?)' },
            'ありがとう': { meaning: 'Thank you', pos: 'interjection', example: 'ありがとうございます。(Thank you very much.)' },
            '日本': { meaning: 'Japan', pos: 'noun', example: '日本は美しい国です。(Japan is a beautiful country.)' },
            '食べる': { meaning: 'to eat', pos: 'verb', example: '私はりんごを食べる。(I eat an apple.)' },
            '本': { meaning: 'book', pos: 'noun', example: 'この本は面白い。(This book is interesting.)' },
            '水': { meaning: 'water', pos: 'noun', example: '水を飲みます。(I drink water.)' },
            '猫': { meaning: 'cat', pos: 'noun', example: '猫が好きです。(I like cats.)' },
            '犬': { meaning: 'dog', pos: 'noun', example: '犬は忠実です。(Dogs are loyal.)' },
            '学校': { meaning: 'school', pos: 'noun', example: '学校に行きます。(I go to school.)' },
            '先生': { meaning: 'teacher', pos: 'noun', example: '先生は優しい。(The teacher is kind.)' },
            '私': { meaning: 'I, me', pos: 'pronoun', example: '私は学生です。(I am a student.)' },
            '今日': { meaning: 'today', pos: 'noun', example: '今日は暑い。(Today is hot.)' },
            '明日': { meaning: 'tomorrow', pos: 'noun', example: '明日会いましょう。(Let\'s meet tomorrow.)' },
            '大きい': { meaning: 'big, large', pos: 'adjective', example: 'この家は大きい。(This house is big.)' },
            '小さい': { meaning: 'small, little', pos: 'adjective', example: '小さい犬がいます。(There is a small dog.)' },

            // English words
            'Hello': { meaning: 'こんにちは', pos: 'interjection', example: 'Hello, how are you today?' },
            'World': { meaning: '世界', pos: 'noun', example: 'The world is a beautiful place.' },
            'Book': { meaning: '本', pos: 'noun', example: 'I read a book every day.' },
            'Learn': { meaning: '学ぶ', pos: 'verb', example: 'I want to learn Japanese.' },
            'Thank': { meaning: '感謝する', pos: 'verb', example: 'Thank you for your help.' },
            'you': { meaning: 'あなた', pos: 'pronoun', example: 'How are you doing?' },
            'The': { meaning: 'その', pos: 'article', example: 'The cat is sleeping.' },
            'is': { meaning: 'です', pos: 'verb', example: 'This is my house.' },
            'a': { meaning: '一つの', pos: 'article', example: 'I have a dog.' },
            'and': { meaning: 'と、そして', pos: 'conjunction', example: 'Apples and oranges.' },
            'to': { meaning: '〜へ', pos: 'preposition', example: 'I go to school.' },
            'of': { meaning: '〜の', pos: 'preposition', example: 'A cup of coffee.' },
            'in': { meaning: '〜の中に', pos: 'preposition', example: 'In the box.' },
            'for': { meaning: '〜のために', pos: 'preposition', example: 'This is for you.' },
            'on': { meaning: '〜の上に', pos: 'preposition', example: 'On the table.' },

            // Spanish
            'Hola': { meaning: 'Hello', pos: 'interjection', example: '¡Hola! ¿Cómo estás?' },
            'Gracias': { meaning: 'Thank you', pos: 'interjection', example: 'Muchas gracias por tu ayuda.' },
            'Buenos': { meaning: 'Good', pos: 'adjective', example: 'Buenos días. (Good morning.)' },

            // French
            'Bonjour': { meaning: 'Hello/Good day', pos: 'interjection', example: 'Bonjour, comment allez-vous?' },
            'Merci': { meaning: 'Thank you', pos: 'interjection', example: 'Merci beaucoup!' },

            // German
            'Hallo': { meaning: 'Hello', pos: 'interjection', example: 'Hallo, wie geht es dir?' },
            'Danke': { meaning: 'Thank you', pos: 'interjection', example: 'Danke schön!' },
            'Guten': { meaning: 'Good', pos: 'adjective', example: 'Guten Tag! (Good day!)' },
        };
    }

    /**
     * Generate a cache key for a translation request
     */
    getCacheKey(text, sourceLanguage, targetLanguage) {
        return `${text}_${sourceLanguage}_${targetLanguage}`;
    }

    /**
     * Translate a single word/phrase
     * @param {string} text - Text to translate
     * @param {string} sourceLanguage - Source language code (e.g., 'jpn', 'eng')
     * @param {string} targetLanguage - Target language code
     * @returns {Promise<Object>} Translation result
     */
    async translate(text, sourceLanguage, targetLanguage) {
        const cacheKey = this.getCacheKey(text, sourceLanguage, targetLanguage);

        // Check cache first
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // Simulate async operation
        await this.delay(50);

        // Check for sample translation
        const sample = this.sampleTranslations[text];

        let result;
        if (sample) {
            result = {
                originalText: text,
                translatedText: `[${this.getLanguageShortCode(targetLanguage)}] ${text}`,
                meaning: sample.meaning,
                partOfSpeech: sample.pos,
                exampleSentence: sample.example
            };
        } else {
            // Generate placeholder translation
            result = {
                originalText: text,
                translatedText: `[${this.getLanguageShortCode(targetLanguage)}] ${text}`,
                meaning: `meaning: ${text}`,
                partOfSpeech: 'unknown',
                exampleSentence: `Example sentence with "${text}" goes here.`
            };
        }

        // Cache the result
        this.cache.set(cacheKey, result);

        return result;
    }

    /**
     * Translate multiple texts (batch operation)
     * @param {string[]} texts - Array of texts to translate
     * @param {string} sourceLanguage - Source language code
     * @param {string} targetLanguage - Target language code
     * @returns {Promise<Object[]>} Array of translation results
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
     * Helper to simulate async delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other modules
window.TranslationService = TranslationService;
