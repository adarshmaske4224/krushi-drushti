SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM schemes;
REPLACE INTO schemes (id, name, description, eligible_states, max_land_size_acres, max_annual_income, eligible_categories, eligible_crops, benefits, application_url, is_active, status, status_note) VALUES

-- ═══════════════════════════════════════════════════════════════
-- सक्रिय योजना (ACTIVE SCHEMES) — सध्या लागू असलेल्या योजना
-- ═══════════════════════════════════════════════════════════════

(1, 'पीएम-किसान सन्मान निधी योजना',
 'भारत सरकारची ही योजना सर्व जमीनधारक शेतकरी कुटुंबांना वर्षाला ६००० रुपये ३ हप्त्यांमध्ये थेट बँक खात्यात जमा करते.',
 'ALL', 50.0, 1000000.0, 'ALL', 'ALL',
 'वर्षाला ६००० रुपये (दर ४ महिन्याला २००० रुपये) थेट बँक खात्यात जमा. आधार संलग्न DBT द्वारे लाभ.',
 'https://pmkisan.gov.in/', true, 'ACTIVE', NULL),

(2, 'नमो शेतकरी महासन्मान निधी योजना',
 'महाराष्ट्र राज्य सरकारची ही योजना पीएम-किसान योजनेच्या सोबतीने वर्षाला अतिरिक्त ६००० रुपये देते. अशा प्रकारे शेतक-यांना एकूण १२००० रुपये मिळतात.',
 'Maharashtra', 50.0, 1000000.0, 'ALL', 'ALL',
 'पीएम-किसान व्यतिरिक्त वर्षाला ६००० रुपये. एकूण लाभ: वर्षाला १२००० रुपये थेट बँक खात्यात.',
 'https://nsmny.maharashtra.gov.in/', true, 'ACTIVE', NULL),

(3, 'प्रधानमंत्री पीक विमा योजना (PMFBY)',
 'नैसर्गिक आपत्ती, कीड आणि रोगांमुळे होणा-या पिकांच्या नुकसानीस विमा संरक्षण. खरीप पिकांसाठी २% आणि रब्बी पिकांसाठी १.५% प्रीमियम.',
 'ALL', 50.0, 1000000.0, 'ALL', 'ALL',
 'किमान प्रीमियमवर पीक विमा: खरीप २%, रब्बी १.५%, नगदी पिके ५%. पिकाच्या नुकसानीची संपूर्ण भरपाई.',
 'https://pmfby.gov.in/', true, 'ACTIVE', NULL),

(4, 'महात्मा जोतिराव फुले शेतकरी कर्जमुक्ती योजना',
 'सहकारी आणि सार्वजनिक क्षेत्रातील बँकांकडून पीक कर्ज घेणा-या लहान व अल्पभूधारक शेतक-यांसाठी महाराष्ट्र सरकारची कर्जमाफी योजना.',
 'Maharashtra', 5.0, 200000.0, 'ALL', 'ALL',
 'पात्र शेतकऱ्यांचे २ लाख रुपयांपर्यंतचे पीक कर्ज माफ. थकीत कर्ज फेडण्यासाठी थेट बँकांच्या खात्यात लाभ.',
 'https://mfrw.maharashtra.gov.in/', true, 'ACTIVE', NULL),

(5, 'गोपीनाथ मुंडे शेतकरी अपघात सुरक्षा सानुग्रह अनुदान योजना',
 'शेतक-यांचा अपघात मृत्यू किंवा कायमचे अपंगत्व आल्यास त्यांच्या कुटुंबाला आर्थिक मदत देणारी विमा योजना.',
 'Maharashtra', 50.0, 1000000.0, 'ALL', 'ALL',
 'अपघाती मृत्यूसाठी २ लाख रुपये, कायमस्वरूपी अपंगत्वासाठी १ लाख रुपये. कोणताही प्रीमियम भरण्याची गरज नाही.',
 'https://krishi.maharashtra.gov.in/', true, 'ACTIVE', NULL),

(6, 'मागेल त्याला शेततळे',
 'शेतक-यांना सिंचनासाठी आणि पावसाचे पाणी साठवण्यासाठी शेततळे बांधण्यासाठी १००% अनुदान देणारी योजना.',
 'Maharashtra', 10.0, 500000.0, 'ALL', 'ALL',
 'शेततळे बांधण्यासाठी ५०,००० रुपयांपर्यंत १००% अनुदान. कोरड्या हंगामात सिंचनासाठी पाण्याचा साठा वाढवणे.',
 'https://mahadbtmahait.gov.in/', true, 'ACTIVE', NULL),

(7, 'प्रधानमंत्री कृषी सिंचन योजना - प्रति थेंब अधिक पीक',
 'पाण्याचा कार्यक्षम वापर सुनिश्चित करण्यासाठी आणि पिकांचे उत्पादन वाढवण्यासाठी ठिबक आणि तुषार सिंचन प्रणालीसाठी अनुदान.',
 'Maharashtra', 12.5, 500000.0, 'ALL', 'ALL',
 'लहान/अल्पभूधारक शेतकऱ्यांसाठी ५५% आणि इतरांसाठी ४५% अनुदान ठिबक आणि तुषार सिंचन संचावर.',
 'https://mahadbtmahait.gov.in/', true, 'ACTIVE', NULL),

(8, 'मुख्यमंत्री शाश्वत कृषी सिंचन योजना',
 'महाराष्ट्रातील सूक्ष्म सिंचन (ठिबक/तुषार) प्रणालीसाठी वाढीव अनुदान देणारी मुख्यमंत्री शाश्वत सिंचन योजना.',
 'Maharashtra', 10.0, 500000.0, 'ALL', 'ALL',
 'शाश्वत शेतीसाठी ठिबक/तुषार सिंचन प्रणालीवर ८०% पर्यंत अनुदान. पुरवठा, स्थापना आणि देखभाल समाविष्ट.',
 'https://mahadbtmahait.gov.in/', true, 'ACTIVE', NULL),

(9, 'कृषी यांत्रिकीकरण उप-अभियान (SMAM)',
 'शेतीतील मजुरांची कमतरता दूर करण्यासाठी आणि आधुनिक शेतीला प्रोत्साहन देण्यासाठी कृषी यंत्रे खरेदीवर अनुदान.',
 'Maharashtra', 10.0, 500000.0, 'ALL', 'ALL',
 'ट्रॅक्टर, पॉवर टिलर, रोटाव्हेटर, थ्रेशर आणि इतर कृषी अवजारांवर ४०-५०% पर्यंत अनुदान.',
 'https://mahadbtmahait.gov.in/', true, 'ACTIVE', NULL),

(10, 'राष्ट्रीय कृषी विकास योजना - रफ्तार (RKVY)',
 'कृषी आणि संलग्न क्षेत्रातील सार्वजनिक गुंतवणूक वाढवण्यासाठी राज्यांना प्रोत्साहित करणारी राष्ट्रीय कृषी विकास योजना.',
 'Maharashtra', 12.5, 500000.0, 'ALL', 'ALL',
 'कृषी पायाभूत सुविधा, कृषी-व्यवसाय स्टार्टअप्स आणि शेती तंत्रज्ञानातील नाविन्यपूर्ण प्रकल्पांसाठी निधी.',
 'https://rkvy.nic.in/', true, 'ACTIVE', NULL),

(11, 'नानाजी देशमुख कृषी संजीवनी योजना (PoCRA)',
 'महाराष्ट्रातील दुष्काळग्रस्त गावांमधील अल्प/अल्पभूधारक शेतक-यांना हवामान-लवचिक शेतीसाठी अर्थसहाय्य करणारी जागतिक बँक अर्थसहाय्यित योजना.',
 'Maharashtra', 4.9, 150000.0, 'ALL', 'ALL',
 'हवामान अनुकूल शेतीसाठी मदत: ५१४२ दुष्काळग्रस्त गावांमध्ये शेततळे, तुषार सिंचन आणि सुधारित बियाणे पुरवणारी योजना.',
 'https://pocra.gov.in/', true, 'ACTIVE', NULL),

(12, 'एकात्मिक फलोत्पादन विकास अभियान',
 'फळे, भाजीपाला, मसाला पिके आणि फुलांच्या लागवडीसह फलोत्पादन पिकांच्या विकासासाठी देण्यात येणारे अनुदान.',
 'Maharashtra', 10.0, 500000.0, 'ALL', 'ALL',
 'फळबाग लागवड, हरितगृह/शेडनेट आणि काढणीपश्चात व्यवस्थापनासाठी ४०-७५% पर्यंत अनुदान.',
 'https://mahadbtmahait.gov.in/', true, 'ACTIVE', NULL),

(13, 'भाऊसाहेब फुंडकर फळबाग लागवड योजना',
 'आंबा, डाळिंब, संत्रा, काजू, पेरू, सीताफळ यांसारखी फळपिके लावण्यासाठी ३ वर्षांच्या कालावधीसाठी अनुदान देणारी योजना.',
 'Maharashtra', 10.0, 300000.0, 'ALL', 'ALL',
 'फळबाग लागवडीच्या ३ वर्षांच्या कालावधीसाठी रोपे आणि देखभालीच्या खर्चावर ५०% पर्यंत अनुदान.',
 'https://mahadbtmahait.gov.in/', true, 'ACTIVE', NULL),

(14, 'बिरसा मुंडा कृषी क्रांती योजना',
 'केवळ एसटी (अनुसूचित जमाती) प्रवर्गातील शेतक-यांसाठी विहिरी, पंप संच आणि पाइपलाइनसह सिंचन सुविधा पुरवणारी विशेष योजना.',
 'Maharashtra', 6.0, 150000.0, 'ST', 'ALL',
 'नवीन विहिरीसाठी ४ लाख रुपयांपर्यंत अनुदान. आदिवासी शेतकऱ्यांसाठी १००% अनुदानित योजना.',
 'https://mahadbtmahait.gov.in/', true, 'ACTIVE', NULL),

(15, 'डॉ. बाबासाहेब आंबेडकर कृषी स्वावलंबन योजना',
 'महाराष्ट्रातील अनुसूचित जाती (SC) आणि नवबौद्ध प्रवर्गातील शेतक-यांना नवीन विहिरी, पंप संच आणि सूक्ष्म सिंचनासाठी आर्थिक मदत.',
 'Maharashtra', 6.0, 150000.0, 'SC,NT,VJNT', 'ALL',
 'नवीन विहिरीसाठी २.५ लाख रुपये अनुदान. अनुसूचित जातीच्या शेतकऱ्यांच्या सक्षमीकरणासाठी प्राधान्य.',
 'https://mahadbtmahait.gov.in/', true, 'ACTIVE', NULL),

(16, 'राष्ट्रीय अन्न सुरक्षा अभियान (NFSM)',
 'अन्नधान्य, कडधान्ये आणि गळीत धान्य उत्पादनात वाढ करण्यासाठी बियाणे आणि तंत्रज्ञान प्रसार करणारी राष्ट्रीय मोहीम.',
 'Maharashtra', 12.5, 500000.0, 'ALL', 'Wheat,Rice,Soybean,Cotton,Sugarcane,Maize',
 'प्रमाणित बियाणे, कृषी अवजारे, सॉईल हेल्थ कार्ड आणि पीक प्रात्यक्षिकांवर अनुदान देणारी केंद्र पुरस्कृत योजना.',
 'https://mahadbtmahait.gov.in/', true, 'ACTIVE', NULL),

(17, 'कांदा चाळ उभारणी अनुदान योजना',
 'कांद्याची साठवणूक शास्त्रीय पद्धतीने करण्यासाठी आणि काढणीपश्चात होणारे नुकसान टाळण्यासाठी कांदा चाळ बांधण्यासाठी अनुदान.',
 'Maharashtra', 15.0, 500000.0, 'ALL', 'Onion',
 'कांदा चाळ बांधण्यासाठी ५०% खर्चाचे अनुदान (कमाल ८७,५०० रुपये). कांदा सडण्यापासून वाचवण्यासाठी उपयुक्त.',
 'https://mahadbtmahait.gov.in/', true, 'ACTIVE', NULL),

(18, 'वाहतूक अनुदान योजना',
 'महाराष्ट्र राज्य कृषी पणन मंडळामार्फत (MSAMB) शेतीमाल बाजारपेठेत नेण्यासाठी येणा-या वाहतूक खर्चावर अनुदान.',
 'Maharashtra', 10.0, 300000.0, 'ALL', 'ALL',
 'शेतीमाल मंडईत नेण्यासासाठी प्रति किलोमीटर ३-५ रुपये वाहतूक खर्च परतावा. मध्यस्थांवर अवलंबून राहणे कमी करणे.',
 'https://www.msamb.com/', true, 'ACTIVE', NULL),

(19, 'मुख्यमंत्री सौर कृषी पंप योजना',
 'डिझेल किंवा इलेक्ट्रिक पंपांना पर्याय म्हणून शेतीसाठी सौर ऊर्जेवर चालणारे पाण्याचे पंप बसवण्यासाठी अनुदान.',
 'Maharashtra', 10.0, 400000.0, 'ALL', 'ALL',
 'सौर कृषी पंपावर ९०% पर्यंत अनुदान. शेतकऱ्याला फक्त १०% रक्कम भरावी लागते. विजेच्या बिलापासून कायमची सुटका.',
 'https://www.mahadiscom.in/solar/', true, 'ACTIVE', NULL),

(20, 'माझी कन्या भाग्यश्री योजना',
 'बीपीएल शेतकरी कुटुंबातील मुलींच्या जन्मानंतर त्यांच्या नावे विमा आणि शैक्षणिक लाभांसाठी ठेव रक्कम जमा करण्याची योजना.',
 'Maharashtra', 50.0, 750000.0, 'ALL', 'ALL',
 'मुलीच्या जन्मानंतर ५०,००० रुपयांची ठेव. मुलींच्या शिक्षणासाठी आणि विम्यासाठी आर्थिक स्थैर्य.',
 'https://womenchild.maharashtra.gov.in/', true, 'ACTIVE', NULL),

(21, 'राज्य कृषी यांत्रिकीकरण योजना',
 'महाराष्ट्रातील शेतक-यांना शेतीतील कार्यक्षमता वाढवण्यासाठी कृषी यंत्रसामग्री आणि अवजारे खरेदीवर राज्यस्तरीय अनुदान.',
 'Maharashtra', 10.0, 500000.0, 'ALL', 'ALL',
 'पॉवर टिलर, रोटाव्हेटर, पेरणी यंत्र, फवारणी यंत्र आणि इतर अवजारांवर ४०-५०% पर्यंत अनुदान.',
 'https://mahadbtmahait.gov.in/', true, 'ACTIVE', NULL),

(22, 'कोरडवाहू क्षेत्र विकास कार्यक्रम (RAD)',
 'कोरडवाहू क्षेत्रासाठी एकात्मिक शेती पद्धतीचा अवलंब करून वर्षभर उत्पन्न मिळवून देणारी योजना.',
 'Maharashtra', 12.5, 300000.0, 'ALL', 'ALL',
 'कोरडवाहू शेतीतील एकात्मिक पद्धतीसाठी हेक्टरी २५,००० ते ५०,००० रुपयांपर्यंत मदत. पशुपालन आणि फलोत्पादन अंतर्भूत.',
 'https://mahadbtmahait.gov.in/', true, 'ACTIVE', NULL),

(23, 'मृद आरोग्य पत्रिका योजना (Soil Health Card)',
 'मृदा चाचणी करून मातीतील पोषक घटकांनुसार पीकनिहाय खत वापराची शिफारस करणारी मोफत योजना.',
 'ALL', 50.0, 1000000.0, 'ALL', 'ALL',
 'दर २ वर्षांनी मोफत सॉईल हेल्थ कार्ड. खत खर्चात बचत आणि जमिनीचा कस टिकवून ठेवण्यासाठी उपयुक्त.',
 'https://soilhealth.dac.gov.in/', true, 'ACTIVE', NULL),

(24, 'किसान क्रेडिट कार्ड (KCC) योजना',
 'वेळेवर कर्ज परतफेड करणा-या शेतक-यांना अल्प व्याजदरात (४%) पीक कर्ज देणारी कृषी क्रेडिट कार्ड योजना.',
 'ALL', 50.0, 1000000.0, 'ALL', 'ALL',
 '३ लाख रुपयांपर्यंतचे पीक कर्ज ४% व्याजदराने उपलब्ध. शेती खर्चासाठी त्वरित कर्ज उपलब्धतेची सुविधा.',
 'https://www.pmkisan.gov.in/KCC', true, 'ACTIVE', NULL),

(25, 'मुख्यमंत्री वयोश्री योजना (शेतकरी पेन्शन)',
 '६० वर्षांवरील वयोवृद्ध शेतक-यांना सन्मानाने जगण्यासाठी दरमहा आर्थिक मदत देणारी पेन्शन योजना.',
 'Maharashtra', 50.0, 1000000.0, 'ALL', 'ALL',
 'दरमहा १००० ते ३००० रुपये पेन्शन. ज्येष्ठ शेतकऱ्यांना उतारवयात आर्थिक आधार देण्यासाठी उपयुक्त.',
 'https://krishi.maharashtra.gov.in/', true, 'ACTIVE', NULL),

-- ═══════════════════════════════════════════════════════════════
-- कालबाह्य/बंद झालेल्या योजना (DEPRECATED/EXPIRED SCHEMES)
-- ═══════════════════════════════════════════════════════════════

(26, 'शेतकरी सन्मान योजना (जुनी कर्जमाफी २००८)',
 '२००८-०९ च्या केंद्रीय अर्थसंकल्पात जाहीर केलेली शेतक-यांसाठी एकवेळची कृषी कर्जमाफी आणि कर्ज सवलत योजना.',
 'ALL', 5.0, 200000.0, 'ALL', 'ALL',
 'पूर्वी: लहान शेतकऱ्यांचे १ लाख रुपयांपर्यंतचे पीक कर्ज माफ झाले होते.',
 'https://krishi.maharashtra.gov.in/', false, 'DEPRECATED',
 'या योजनेची मुदत संपली आहे (२००८). सध्या महात्मा जोतिराव फुले शेतकरी कर्जमुक्ती योजना (ID:४) पहा.'),

(27, 'जलयुक्त शिवार अभियान (टप्पा १)',
 'प्रत्येक वर्षी ५००० गावांमध्ये जलसंधारणाद्वारे महाराष्ट्र दुष्काळमुक्त करण्यासाठी जलसंधारण योजना.',
 'Maharashtra', 50.0, 1000000.0, 'ALL', 'ALL',
 'पूर्वी: सिमेंट नाला बांध, पाणी साठवण तलाव आणि जलसंधारण कामांवर भर.',
 'https://krishi.maharashtra.gov.in/', false, 'DEPRECATED',
 'जलयुक्त शिवार टप्पा १ (२०१५-२०१९) संपला आहे. नानाजी देशमुख कृषी संजीवनी योजना (PoCRA, ID:११) हा सध्याचा पर्याय आहे.'),

(28, 'डॉ. श्यामप्रसाद मुखर्जी जन वन विकास योजना',
 'पडीक जमीन आणि समुदाय वन परिसराच्या विकासासाठी शेतकऱ्यांच्या सहभागासह सामाजिक वनीकरण योजना.',
 'Maharashtra', 12.5, 300000.0, 'ALL', 'ALL',
 'पूर्वी: खाजगी जमिनीवर वृक्षारोपणासाठी अनुदान आणि उत्पादनाची हमी.',
 'https://mahadbtmahait.gov.in/', false, 'SUSPENDED',
 'या योजनेवर सध्या काम स्थगित आहे. वृक्षलागवडीसाठी सध्या Agroforestry उप-अभियानांतर्गत अर्ज करता येतील.'),

(29, 'RKVY प्लास्टिक अस्तरीकरण योजना (जुनी)',
 'पाण्याची गळती रोखण्यासाठी अस्तित्वात असलेल्या शेततळ्यांना प्लास्टिकचे अस्तरीकरण करण्यासाठी आरकेव्हीवाय अंतर्गत जुनी योजना.',
 'Maharashtra', 10.0, 500000.0, 'ALL', 'ALL',
 'पूर्वी: जुन्या शेततळ्यांसाठी प्लास्टिक अस्तरीकरण साहित्य आणि खर्चावर अनुदान.',
 'https://mahadbtmahait.gov.in/', false, 'EXPIRED',
 'हा जुना उपक्रम आता बंद झाला आहे. नवीन अर्जांसाठी मुख्यमंत्री शाश्वत कृषी सिंचन योजना (ID:८) पहा.'),

(30, 'पीएम-आशा (PM-AASHA)',
 'शेतक-यांना हमीभाव (MSP) मिळवून देण्यासाठी सुरू केलेली किंमत समर्थन आणि उत्पन्न संरक्षण योजना.',
 'ALL', 50.0, 1000000.0, 'ALL', 'Soybean,Cotton,Tur,Moong',
 'पूर्वी: बाजारातील भाव हमीभावापेक्षा कमी झाल्यावर पिकाची सरकारी दराने खरेदी.',
 'https://pib.gov.in/', false, 'DEPRECATED',
 'पीएम-आशा आता स्वतंत्र योजना म्हणून बंद असून ती नाफेड/मार्कफेड द्वारे केल्या जाणा-या MSP खरेदीत विलीन झाली आहे.');
SET FOREIGN_KEY_CHECKS = 1;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

LOCK TABLES `district_climate` WRITE;
/*!40000 ALTER TABLE `district_climate` DISABLE KEYS */;
INSERT INTO `district_climate` (`id`, `district_name`, `rainfall_min`, `rainfall_max`, `temp_min`, `temp_max`, `humidity_min`, `humidity_max`, `wind_min`, `wind_max`, `climate_type`, `soil_type`, `water_source`) VALUES (1,'Yavatmal',900,1000,20,34,60,75,8,14,'Tropical Semi-Arid','Deep Black Soil','Rivers'),(2,'Buldhana',800,950,21,36,50,65,5,12,'Semi-Arid','Black Soil','Wells'),(3,'Washim',850,950,20,36,55,70,10,15,'Tropical Semi-Arid','Black Cotton Soil','Borewell'),(4,'Amravati',900,1000,20,35,55,70,10,15,'Tropical','Black Soil','Rivers'),(5,'Hingoli',900,1000,21,35,55,72,9,14,'Semi-Arid','Black + Red Soil','Rivers + Wells');
/*!40000 ALTER TABLE `district_climate` ENABLE KEYS */;
UNLOCK TABLES;

LOCK TABLES `crop_information` WRITE;
/*!40000 ALTER TABLE `crop_information` DISABLE KEYS */;
INSERT INTO `crop_information` (`id`, `crop_name`, `category`, `season`, `soil_type`, `temp_min`, `temp_max`, `rainfall_min`, `rainfall_max`, `growth_days`, `yield_per_acre`, `avg_price`, `avg_cost`, `water_requirement`) VALUES (1,'Rice','Grain','Kharif','Clay/Loamy',20,35,1000,1200,120,20,2200,35000,'High'),(2,'Wheat','Grain','Rabi','Loamy',15,25,300,400,120,18,2300,28000,'Medium'),(3,'Maize','Grain','Kharif','Loamy',18,27,500,800,100,25,2100,25000,'Medium'),(4,'Jowar','Grain','Kharif/Rabi','Black',20,32,400,600,110,15,3000,20000,'Low'),(5,'Bajra','Grain','Kharif','Sandy',25,35,300,500,90,12,2500,18000,'Low'),(6,'Ragi','Grain','Kharif','Red',20,30,500,700,100,10,3200,22000,'Low'),(7,'Soybean','Pulse/Oilseed','Kharif','Black',20,30,500,900,100,12,6000,25000,'Medium'),(8,'Groundnut','Pulse/Oilseed','Kharif','Sandy',25,35,500,700,110,10,5500,30000,'Medium'),(9,'Sunflower','Pulse/Oilseed','Kharif/Rabi','Loamy',20,30,400,600,90,8,6500,26000,'Medium'),(10,'Mustard','Pulse/Oilseed','Rabi','Loamy',10,25,300,400,120,8,6000,24000,'Medium'),(11,'Cotton','Fruit','Kharif','Black',25,35,600,800,180,8,7500,35000,'Medium'),(12,'Sugarcane','Fruit','All','Loamy',20,38,1200,1500,300,400,350,120000,'High'),(13,'Tur (Arhar)','Pulse/Oilseed','Kharif','Black',25,35,600,1000,160,10,7000,28000,'Low'),(14,'Gram (Chana)','Pulse/Oilseed','Rabi','Loamy',20,25,300,400,120,10,5200,22000,'Medium'),(15,'Moong','Pulse/Oilseed','Kharif/Zaid','Sandy',25,35,400,600,70,6,7000,20000,'Low'),(16,'Urad','Pulse/Oilseed','Kharif','Black',25,35,500,700,90,6,6500,21000,'Low'),(17,'Rajma','Pulse/Oilseed','Rabi','Loamy',15,25,300,400,120,8,9000,23000,'Medium'),(18,'Lentil','Pulse/Oilseed','Rabi','Loamy',18,25,300,400,110,8,6500,22000,'Medium'),(19,'Potato','Vegetable','Rabi','Sandy Loam',15,20,300,500,90,250,1200,120000,'Medium'),(20,'Onion','Vegetable','Rabi','Black',18,25,400,600,120,150,1500,80000,'Medium'),(21,'Tomato','Vegetable','All','Loamy',20,30,400,600,90,200,1200,70000,'Medium'),(22,'Chili','Vegetable','Kharif','Loamy',20,30,500,700,150,40,9000,90000,'Medium'),(23,'Brinjal','Vegetable','All','Loamy',20,30,500,700,120,150,1800,60000,'Medium'),(24,'Cabbage','Vegetable','Rabi','Loamy',15,20,300,400,100,200,1000,45000,'Medium'),(25,'Cauliflower','Vegetable','Rabi','Loamy',15,20,300,400,100,200,1200,50000,'Medium'),(26,'Carrot','Vegetable','Rabi','Sandy',10,20,300,400,90,150,1800,40000,'Medium'),(27,'Beetroot','Vegetable','Rabi','Sandy',15,25,300,400,90,150,2000,38000,'Medium'),(28,'Spinach','Vegetable','All','Loamy',15,25,300,500,45,80,1500,25000,'Medium'),(29,'Cucumber','Vegetable','Zaid','Sandy',20,30,300,400,60,120,1200,30000,'Medium'),(30,'Pumpkin','Vegetable','Kharif','Sandy',25,30,500,700,100,150,1000,32000,'Low'),(31,'Bottle Gourd','Vegetable','Zaid','Sandy',20,30,400,600,90,150,1500,35000,'Low'),(32,'Bitter Gourd','Vegetable','Zaid','Sandy',20,30,400,600,90,120,2000,40000,'Low'),(33,'Okra','Vegetable','Kharif','Sandy',25,35,400,600,60,80,2000,35000,'Low'),(34,'Sweet Corn','Vegetable','Zaid','Loamy',20,30,400,600,80,80,1800,42000,'Medium'),(35,'Mango','Fruit','All','Loamy',24,30,500,1000,1825,80,3500,60000,'Low'),(36,'Banana','Fruit','All','Loamy',20,35,800,1200,365,300,1000,80000,'High'),(37,'Papaya','Fruit','All','Sandy',25,35,600,800,270,200,1200,70000,'Medium'),(38,'Guava','Fruit','All','Loamy',20,30,600,1000,1095,100,2000,50000,'Medium'),(39,'Pomegranate','Fruit','All','Sandy',20,35,500,700,730,80,6000,90000,'Low'),(40,'Orange','Fruit','All','Loamy',15,30,800,1000,1095,120,2500,70000,'Medium'),(41,'Grapes','Fruit','Rabi','Black',15,30,500,700,730,100,5000,120000,'Medium'),(42,'Watermelon','Fruit','Zaid','Sandy',20,30,300,400,90,200,1200,35000,'Medium'),(43,'Muskmelon','Fruit','Zaid','Sandy',20,30,300,400,80,180,1500,36000,'Medium'),(44,'Strawberry','Fruit','Winter','Sandy',10,20,300,400,120,60,7000,150000,'Medium'),(45,'Dragon Fruit','Fruit','All','Sandy',20,35,400,600,365,80,8000,100000,'Medium'),(46,'Avocado','Fruit','All','Loamy',20,30,600,1000,1095,100,10000,90000,'Medium'),(47,'Chia Seeds','Pulse/Oilseed','Rabi','Sandy',15,25,300,400,90,6,15000,20000,'Low'),(48,'Quinoa','Grain','Rabi','Sandy',15,25,300,400,120,8,12000,22000,'Low'),(49,'Broccoli','Vegetable','Rabi','Loamy',15,20,300,400,90,80,3000,45000,'Medium'),(50,'Capsicum','Vegetable','Polyhouse','Loamy',20,25,0,0,120,100,4000,200000,'Medium'),(51,'Dragon Fruit','Fruit','All','Sandy Loam',20,35,400,800,330,90,8000,80000,'Low'),(52,'Strawberry','Fruit','Rabi','Sandy Loam',10,25,300,600,210,70,7000,70000,'Medium'),(53,'Avocado','Fruit','All','Loamy Soil',15,30,800,1200,1200,70,9000,90000,'Medium'),(54,'Fig','Fruit','All','Loamy Soil',15,35,400,800,1100,60,6000,60000,'Low'),(55,'Kiwi','Fruit','Rabi','Loamy Soil',10,30,900,1500,1100,90,8000,90000,'Medium'),(56,'Passion Fruit','Fruit','All','Sandy Loam',20,35,600,1000,800,90,6000,50000,'Medium'),(57,'Amla','Fruit','All','Sandy Loam',20,40,500,800,1200,100,4000,40000,'Low'),(58,'Mulberry','Fruit','All','Loamy Soil',20,35,600,900,900,70,3000,35000,'Medium'),(59,'Lemon','Fruit','All','Sandy Loam',20,35,600,1000,900,90,4000,50000,'Medium'),(60,'Soybean','Pulse/Oilseed','Kharif','Black Soil',20,32,500,900,100,9,5000,12000,'Medium'),(61,'Chia Seeds','Pulse/Oilseed','Rabi','Sandy Loam',18,30,300,600,90,6,12000,10000,'Low'),(62,'Quinoa','Grain','Rabi','Sandy Soil',15,30,300,500,100,7,7500,11000,'Low'),(63,'Cotton','Fruit','Kharif','Black Soil',21,35,600,1000,170,9,7000,20000,'High'),(64,'Moringa','Vegetable','All','Sandy Loam',25,40,250,1500,240,12,30,15000,'Low'),(65,'Tur','Pulse/Oilseed','Kharif','Black Soil',20,35,600,1000,180,7,7000,13000,'Medium'),(66,'Rajma','Pulse/Oilseed','Rabi','Loamy Soil',15,28,400,700,115,8,9000,14000,'Medium'),(67,'Groundnut','Pulse/Oilseed','Kharif','Sandy Loam',20,30,500,800,110,10,6000,12000,'Medium'),(68,'Sesame','Pulse/Oilseed','Kharif','Sandy Soil',25,35,400,700,85,5,8000,9000,'Low'),(69,'Maize','Grain','Kharif','Loamy Soil',18,32,500,800,100,22,2000,10000,'Medium'),(70,'Sweet Corn','Vegetable','Kharif','Fertile Loam',18,30,500,800,75,65,30,15000,'Medium'),(71,'Jowar','Grain','Kharif','Black Soil',20,35,400,700,100,9,2800,9000,'Low'),(72,'Ragi','Grain','Kharif','Red Soil',20,30,500,1000,95,8,3500,8500,'Low'),(73,'Bajra','Grain','Kharif','Sandy Soil',25,35,300,500,85,9,2300,8000,'Low'),(74,'Foxtail Millet','Grain','Kharif','Sandy Loam',20,30,400,650,85,7,4500,9000,'Low'),(75,'Potato','Vegetable','Rabi','Sandy Loam',15,25,300,500,100,90,1600,25000,'High'),(76,'Linseed','Pulse/Oilseed','Rabi','Loamy Soil',10,25,300,500,105,6,5500,9000,'Low'),(77,'Garlic','Vegetable','Rabi','Sandy Loam',12,25,400,700,130,45,7500,30000,'Medium'),(78,'French Beans','Vegetable','Rabi','Loamy Soil',15,25,350,600,95,38,60,18000,'Medium'),(79,'Lettuce','Vegetable','Rabi','Sandy Loam',10,22,300,500,50,28,60,15000,'Low'),(80,'Broccoli','Vegetable','Rabi','Loamy Soil',10,23,350,600,80,32,60,20000,'Medium'),(81,'Zucchini','Vegetable','Rabi','Sandy Loam',18,28,350,600,65,45,60,18000,'Medium'),(82,'Beetroot','Vegetable','Rabi','Sandy Loam',10,25,300,500,65,28,30,12000,'Low'),(83,'Oats','Grain','Rabi','Loamy Soil',10,25,400,700,105,11,2500,9000,'Medium'),(84,'Muskmelon','Fruit','Zaid','Sandy Loam',22,35,200,400,80,70,25,20000,'Medium'),(85,'Ridge Gourd','Vegetable','Zaid','Sandy Loam',22,35,300,600,65,40,30,15000,'Medium'),(86,'Ash Gourd','Vegetable','Zaid','Loamy Soil',22,35,400,700,100,90,25,18000,'Medium'),(87,'Snake Gourd','Vegetable','Zaid','Sandy Loam',22,35,300,600,70,35,45,15000,'Medium'),(88,'Baby Corn','Vegetable','Zaid','Loamy Soil',20,32,400,700,65,18,90,17000,'Medium'),(89,'Microgreens','Vegetable','Zaid','Organic Soil',20,30,100,200,18,10,350,12000,'Low'),(90,'Lemongrass','Fruit','Zaid','Sandy Loam',20,35,300,1000,120,45,100,15000,'Low'),(91,'Cherry Tomato','Vegetable','Zaid','Loamy Soil',18,30,400,700,85,70,90,25000,'Medium'),(92,'Turnip','Vegetable','Zaid','Sandy Loam',10,25,300,500,50,28,30,10000,'Low');
/*!40000 ALTER TABLE `crop_information` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

