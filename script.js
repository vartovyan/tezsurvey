/* ============================================
   CONFIGURATION
   ============================================ */
// IMPORTANT: Replace with your deployed Google Apps Script web app URL
const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

/* ============================================
   SECTION NAVIGATION STATE
   ============================================ */
const SECTION_IDS = ['consent-section', 'demographics-section', 'scale1-section', 'scale2-section', 'scale3-section', 'submit-section'];
let currentSectionIndex = 0;

/* ============================================
   CONSENT TEXT (Turkish)
   ============================================ */
const CONSENT_PARAGRAPHS = [
  'Bu araştırma, İstanbul Bilgi Üniversitesi Psikoloji Bölümü tarafından yürütülen, danışmanlığını Doç. Dr. Deniz Tahiroğlu\'nun yaptığı PSY491 dersi Lisans Bitirme Tezi kapsamında gerçekleştirilmektedir. Bu araştırmanın amacı, yetişkin bireylerin romantik ilişkilerindeki bağlanma temelli bağımlılık düzeylerini; olumlu çocukluk deneyimleri, bağlanma stilleri ve ilişki türü değişkenlerini ölçmektir.',
  'Araştırmaya katılım tamamen gönüllülük esasına dayanmaktadır. Çalışmaya katılmayı kabul etmeniz durumunda, çevrim içi (online) ortamda gerçekleştirilecek olan anket çalışması yaklaşık 15-20 dakika sürecektir. Araştırma, 25-45 yaş aralığında, Türkiye\'de ikamet eden, veri toplama araçlarını Türkçe olarak anlayıp yanıtlayabilecek yeterliliğe sahip ve halihazırda romantik bir ilişkisi bulunan yetişkin katılımcıları kapsamaktadır.',
  'Soruların yanıtlanması sırasında herhangi bir ses veya görüntü kaydı alınmayacak olup cevaplar yazılı olarak araştırma verisinde kullanılmak üzere kaydedilecektir. Araştırma süresinde elde edilen veriler gizli tutulacak olup kişisel bilgiler dolaylı veya doğrudan hiçbir şekilde rapora yansımayacaktır, üçüncü kişilere gösterilmeyecektir.',
  'Araştırma süresince dilediğiniz anda çalışmadan çekilme hakkına sahipsiniz. Ayrıca yanıtlamak istemediğiniz sorulara cevap vermeme hakkınız bulunmaktadır.',
  'Bu formu onayladığınız takdirde yukarıda yer alan bilgileri okuduğunuzu, anladığınızı ve araştırmaya gönüllü olarak katılmayı kabul ettiğinizi göstermektedir.',
];

const CONSENT_CONTACT = 'Çalışma hakkında daha fazla bilgi almak için sorularınızı araştırmanın yürütücüsü Merve Ceren Çırağ\'a <a href="mailto:ceren.cirag@bilgiedu.net">ceren.cirag@bilgiedu.net</a> üzerinden ulaşabilirsiniz.';

/* ============================================
   DEBRIEFING TEXT
   ============================================ */
const DEBRIEFING_HTML = `
  <h3>Araştırma Hakkında Bilgilendirme</h3>
  <p>Bu araştırma İstanbul Bilgi Üniversitesi Psikoloji Bölümü lisans bitirme tezi kapsamında yürütülmektedir. Çalışmanın amacı romantik ilişkilerde bağlanma temelli bağımlılık ile olumlu çocukluk yaşantıları arasındaki ilişkiyi incelemektir.</p>
  <p>Anket kapsamında verdiğiniz tüm yanıtlar anonim olarak değerlendirilmekte olup yalnızca bilimsel araştırma amacıyla kullanılacaktır. Herhangi bir kişisel kimlik bilgisi toplanmamaktadır.</p>
  <p>Araştırma hakkında sorularınız olması durumunda araştırmanın yürütücüsü Merve Ceren Çırağ ile aşağıdaki e-posta adresi üzerinden iletişime geçebilirsiniz:<br><a href="mailto:ceren.cirag@bilgiedu.net">ceren.cirag@bilgiedu.net</a></p>
  <p><strong>Katkınız için tekrar teşekkür ederiz.</strong></p>
`;

/* ============================================
   DEMOGRAPHICS QUESTIONS DATA
   ============================================ */
const DEMOGRAPHICS = [
  {
    id: 'email', type: 'email', name: 'email', required: true,
    legend: 'E-posta adresiniz:',
    placeholder: 'ornek@email.com'
  },
  {
    id: 'age', type: 'radio', name: 'age', required: true,
    legend: 'Yaşınız:',
    options: ['25-29', '30-34', '35-39', '40-45']
  },
  {
    id: 'gender', type: 'radio', name: 'gender', required: true,
    legend: 'Cinsiyetiniz:',
    options: ['Kadın', 'Erkek', 'Belirtmek istemiyorum']
  },
  {
    id: 'education', type: 'radio', name: 'education', required: true,
    legend: 'Eğitim düzeyi:',
    options: ['İlkokul', 'Ortaokul', 'Lise', 'Lisans', 'Yüksek Lisans', 'Doktora']
  },
  {
    id: 'relationship', type: 'radio', name: 'relationship_status', required: true,
    legend: 'Mevcut bir romantik ilişkiniz var mı?',
    options: ['Evet', 'Hayır'],
    disqualifyValue: 'Hayır'
  },
  {
    id: 'reltype', type: 'radio', name: 'relationship_type', required: true,
    legend: 'İlişki Durumunuz:',
    options: ['Evli', 'Sevgili', 'Flört/Dating']
  },
  {
    id: 'duration', type: 'radio', name: 'relationship_duration', required: true,
    legend: 'Mevcut ilişkinizin süresi:',
    options: ['0-6 ay', '7-11 ay', '1-3 yıl', '4-6 yıl', '7 yıl ve üzeri']
  },
  {
    id: 'caregivers', type: 'checkbox', name: 'caregivers', required: true,
    legend: 'Doğumunuzdan 12 yaşınıza kadar size bakım veren öncelikli kişi/kişiler kimdi?',
    legendNote: '(Birden fazla seçenek işaretleyebilirsiniz.)',
    options: ['Anne', 'Baba', 'Anne ve baba', 'Büyükanne/Büyükbaba', 'Bakıcı', 'Koruyucu aile/Kurum', 'Diğer akrabalar'],
    hasOther: true, otherName: 'caregivers_other'
  },
  {
    id: 'parents', type: 'radio', name: 'parents_marital', required: true,
    legend: '18 yaşınıza kadar ebeveynlerinizin birliktelik durumu nasıldı?',
    options: [
      'Evliydi ve birlikte yaşamaya devam ettiler',
      'Boşandılar',
      'Bir süre ayrı kaldılar, daha sonra tekrar bir araya geldiler',
      'Hiç evlenmediler'
    ],
    hasOther: true, otherName: 'parents_marital_other'
  },
  {
    id: 'family', type: 'radio', name: 'family_structure', required: true,
    legend: 'Çocukluk ve ergenlik döneminizde yaşadığınız ev ortamındaki aile yapısı nasıldı?',
    options: ['Çekirdek aile', 'Tek ebeveynli aile', 'Yeniden evlenilmiş/karma aile', 'Geniş aile'],
    hasOther: true, otherName: 'family_structure_other'
  }
];

/* ============================================
   SCALE 1: Codependency (25 items, 5-point)
   ============================================ */
const SCALE1_QUESTIONS = [
  'İnsanlar istemeselerde, kendimi onların sorunlarını çözmelerine yardım etmek zorunda gibi hissederim.',
  'İnsanların davranışlarını ve olayları kontrolüm altında tutmaya çalışırım.',
  'İnsanların doğal davranmalarına ve olayların doğal akışında gitmesine izin vermekten korkarım.',
  'Kendimden utanırım.',
  'Çaresiz ve suçlu hissettirerek, baskı ve tehdit uygulayarak, hükmedici davranarak, tavsiyelerde bulunarak ya da idare ederek insanları ve olayları kontrol etmeye çalışırım.',
  'Mide, karaciğer, bağırsak ya da idrar kesemle ile ilgili bir sağlık problemi yaşayacağım diye endişe duyarım.',
  'Kafam vücudumun tükeneceği (iflas edeceği) fikriyle meşguldür.',
  'Başkalarının sorunlarını çözmelerine yardım etmek zorundaymışım gibi hissederim.',
  'Sağlık durumumu ailem ve arkadaşlarımınkinden kötü bulurum.',
  'Gerçekten üzgün ya da kızgın hissetsem bile yüzümde mutluluk ifadesi olur.',
  'Duygularımı belli etmem, belli edeceksem de uygun ortam ve zamanı beklerim.',
  'Kendimi bitkin ve harap olmuş hissederim.',
  'Kendimi öyle gizlerim ki hiç kimse gerçekten nasıl biri olduğumu bilemez.',
  'Duygularımı sıkı kontrol ederim.',
  'Çocukluğumda, yaşadığımız sorunlarla ilgili olarak ailem benimle açık bir şekilde konuşmazdı.',
  'Mide, bağırsak ve idrar kesemle ilgili sağlık sorunlarım olur.',
  'Düşüncelerim, duygularım, görünüşüm, davranışım ve yaptığım her şeyde kendimi kusurlu bulurum.',
  'Bana sıkıntı veren duygu ve düşüncelerimi hatırlamamaya çalışırım.',
  'Çocukluğumda sıkıntılı, duygusuz, madde bağımlılığı olan kişiler (alkol, uyuşturucu vb) veya problemlerle dolu bir aile ortamı vardı.',
  'Çocukluğumda ailem duygu ve sevgilerini bana açıkça gösterirlerdi.',
  'Kendimi her şey için çok fazla suçlarım.',
  'Şimdi değerlendirdiğimde çocuklukta yaşadığımız sorunlarla ilgili olarak ailemin bulduğu çözüm yollarından hoşnut olmadığımı hissederim.',
  'Şimdi değerlendirdiğimde çocukken ailemin benimle iletişim kurma biçiminden hoşnut olmadığımı hissederim.',
  'Kendimi küçük düşürülmüş veya sıkıntılı hissederim.',
  'Kendimden nefret ederim.'
];

/* ============================================
   SCALE 2: ECR-R / YİYE-II (36 items, 7-point)
   ============================================ */
const SCALE2_QUESTIONS = [
  'Birlikte olduğum kişinin sevgisini kaybetmekten korkarım.',
  'Gerçekte ne hissettiğimi birlikte olduğum kişiye göstermemeyi tercih ederim.',
  'Sıklıkla, birlikte olduğum kişinin artık benimle olmak istemeyeceği korkusuna kapılırım.',
  'Özel duygu ve düşüncelerimi birlikte olduğum kişiyle paylaşmak konusunda kendimi rahat hissederim.',
  'Sıklıkla, birlikte olduğum kişinin beni gerçekten sevmediği kaygısına kapılırım.',
  'Romantik ilişkide olduğum kişilere güvenip inanmak konusunda kendimi rahat bırakmakta zorlanırım.',
  'Romantik ilişkide olduğum kişilerin beni, benim onları önemsediğim kadar önemsemeyeceklerinden endişe duyarım.',
  'Romantik ilişkide olduğum kişilere yakın olma konusunda çok rahatımdır.',
  'Sıklıkla, birlikte olduğum kişinin bana duyduğu hislerin benim ona duyduğum hisler kadar güçlü olmasını isterim.',
  'Romantik ilişkide olduğum kişilere açılma konusunda kendimi rahat hissetmem.',
  'İlişkilerimi kafama çok takarım.',
  'Romantik ilişkide olduğum kişilere fazla yakın olmamayı tercih ederim.',
  'Benden uzakta olduğunda, birlikte olduğum kişinin başka birine ilgi duyabileceği korkusuna kapılırım.',
  'Romantik ilişkide olduğum kişi benimle çok yakın olmak istediğinde rahatsızlık duyarım.',
  'Romantik ilişkide olduğum kişilere duygularımı gösterdiğimde, onların benim için aynı şeyleri hissetmeyeceğinden korkarım.',
  'Birlikte olduğum kişiyle kolayca yakınlaşabilirim.',
  'Birlikte olduğum kişinin beni terk edeceğinden pek endişe duymam.',
  'Birlikte olduğum kişiyle yakınlaşmak bana zor gelmez.',
  'Romantik ilişkide olduğum kişi kendimden şüphe etmeme neden olur.',
  'Genellikle, birlikte olduğum kişiyle sorunlarımı ve kaygılarımı tartışırım.',
  'Terk edilmekten pek korkmam.',
  'Zor zamanlarımda, romantik ilişkide olduğum kişiden yardım istemek bana iyi gelir.',
  'Birlikte olduğum kişinin, bana benim istediğim kadar yakınlaşmak istemediğini düşünürüm.',
  'Birlikte olduğum kişiye hemen hemen her şeyi anlatırım.',
  'Romantik ilişkide olduğum kişiler bazen bana olan duygularını sebepsiz yere değiştirirler.',
  'Başımdan geçenleri birlikte olduğum kişiyle konuşurum.',
  'Çok yakın olma arzum bazen insanları korkutup uzaklaştırır.',
  'Birlikte olduğum kişiler benimle çok yakınlaştığında gergin hissederim.',
  'Romantik ilişkide olduğum bir kişi beni yakından tanıdıkça, "gerçek ben"den hoşlanmayacağından korkarım.',
  'Romantik ilişkide olduğum kişilere güvenip inanma konusunda rahatımdır.',
  'Birlikte olduğum kişiden ihtiyaç duyduğum şefkat ve desteği görememek beni öfkelendirir.',
  'Romantik ilişkide olduğum kişiye güvenip inanmak benim için kolaydır.',
  'Başka insanlara denk olamamaktan endişe duyarım.',
  'Birlikte olduğum kişiye şefkat göstermek benim için kolaydır.',
  'Birlikte olduğum kişi beni sadece kızgın olduğumda önemser.',
  'Birlikte olduğum kişi beni ve ihtiyaçlarımı gerçekten anlar.'
];

/* ============================================
   SCALE 3: Positive Childhood (7 items, 5-point)
   ============================================ */
const SCALE3_QUESTIONS = [
  'Ailenizle duygularınız hakkında hangi sıklıkta konuşabiliyordunuz?',
  'Zor zamanlarda ailenizin yanınızda olduğunu hangi sıklıkta hissediyordunuz?',
  'Çocukluk döneminizin ne kadarında sizi evinizde güvende ve korunmuş hissettiren bir yetişkin vardı?',
  'Çevrenizde hangi sıklıkta anne ve babanızın dışında sizinle gerçekten ilgilenen en az iki yetişkin oldu?',
  'Arkadaşlarınız tarafından ne kadar sık desteklendiğinizi hissediyordunuz?',
  'Hangi sıklıkta kendinizi okuduğunuz liseye ait hissediyordunuz?',
  'Geleneksel ve toplu etkinliklere katılmaktan hangi sıklıkta keyif alırdınız?'
];

/* ============================================
   SCALE LABELS
   ============================================ */
const SCALE1_LABELS = { 1: 'Hiçbir zaman', 2: 'Ara sıra', 3: 'Sık sık', 4: 'Genellikle', 5: 'Çoğu zaman' };
const SCALE2_LABELS = { 1: 'Hiç Katılmıyorum', 4: 'Kararsızım', 7: 'Tamamen Katılıyorum' };
const SCALE3_LABELS = { 1: 'Hiçbir Zaman', 2: 'Nadiren', 3: 'Bazen', 4: 'Çoğu Zaman', 5: 'Her Zaman' };

/* ============================================
   DOM READY
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderConsentText();
  renderDebriefingText();
  renderDemographics();
  renderScaleInstructions();
  renderScaleLegends();
  renderLikertScale('scale1-container', SCALE1_QUESTIONS, 5, SCALE1_LABELS, 's1');
  renderLikertScale('scale2-container', SCALE2_QUESTIONS, 7, SCALE2_LABELS, 's2');
  renderLikertScale('scale3-container', SCALE3_QUESTIONS, 5, SCALE3_LABELS, 's3');
  addNextButtons();
  initSectionNavigation();
  setupDisqualificationListeners();
  setupOtherFieldListeners();
  setupFormSubmission();
  updateProgressBar();
});

/* ============================================
   SECTION NAVIGATION
   ============================================ */
function initSectionNavigation() {
  // Hide all sections except the first one
  SECTION_IDS.forEach((id, index) => {
    const section = document.getElementById(id);
    if (index !== 0) {
      section.classList.add('section-hidden');
    }
  });
}

function addNextButtons() {
  // Add a "Next" button to each section except the submit section
  SECTION_IDS.forEach((id, index) => {
    if (id === 'submit-section') return;
    const section = document.getElementById(id);
    const card = section.querySelector('.section-card');
    if (!card) return;

    const btnContainer = document.createElement('div');
    btnContainer.className = 'section-nav';
    btnContainer.innerHTML = `
      <button type="button" class="btn-next" id="next-${id}" onclick="goToNextSection(${index})">
        <span>Sonraki Bölüm</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    `;
    card.appendChild(btnContainer);
  });
}

function goToNextSection(currentIndex) {
  // Clear previous errors
  document.querySelectorAll('.question-group.error, .likert-item.error').forEach(el => el.classList.remove('error'));

  // Validate the current section before proceeding
  const sectionId = SECTION_IDS[currentIndex];
  const errors = validateSection(sectionId);

  if (errors.length > 0) {
    const firstError = document.getElementById(errors[0].fieldId);
    if (firstError) {
      firstError.classList.add('error');
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    showToast(errors[0].message);
    return;
  }

  // Hide current section, show next
  const currentSection = document.getElementById(SECTION_IDS[currentIndex]);
  const nextIndex = currentIndex + 1;
  const nextSection = document.getElementById(SECTION_IDS[nextIndex]);

  currentSection.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  currentSection.style.opacity = '0';
  currentSection.style.transform = 'translateY(-10px)';

  setTimeout(() => {
    currentSection.classList.add('section-hidden');
    currentSection.style.opacity = '';
    currentSection.style.transform = '';
    nextSection.classList.remove('section-hidden');
    nextSection.style.animation = 'fadeInUp 0.5s ease both';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    currentSectionIndex = nextIndex;
    updateProgressBar();
  }, 300);
}

/* ============================================
   SECTION VALIDATION
   ============================================ */
function validateSection(sectionId) {
  const errors = [];

  if (sectionId === 'consent-section') {
    const consent = document.querySelector('input[name="consent"]:checked');
    if (!consent) {
      errors.push({ fieldId: 'qg-consent', message: 'Lütfen onam formunu onaylayınız.' });
    }
  }

  if (sectionId === 'demographics-section') {
    // Email
    const emailInput = document.querySelector('input[name="email"]');
    if (emailInput && (!emailInput.value || !emailInput.value.includes('@'))) {
      errors.push({ fieldId: 'qg-email', message: 'Lütfen geçerli bir e-posta adresi giriniz.' });
      return errors;
    }
    // Required radios in demographics
    const demoRadios = [
      { name: 'age', fieldId: 'qg-age', msg: 'Lütfen yaşınızı seçiniz.' },
      { name: 'gender', fieldId: 'qg-gender', msg: 'Lütfen cinsiyetinizi seçiniz.' },
      { name: 'education', fieldId: 'qg-education', msg: 'Lütfen eğitim düzeyinizi seçiniz.' },
      { name: 'relationship_status', fieldId: 'qg-relationship', msg: 'Lütfen ilişki durumunuzu seçiniz.' },
      { name: 'relationship_type', fieldId: 'qg-reltype', msg: 'Lütfen ilişki türünüzü seçiniz.' },
      { name: 'relationship_duration', fieldId: 'qg-duration', msg: 'Lütfen ilişki sürenizi seçiniz.' },
      { name: 'parents_marital', fieldId: 'qg-parents', msg: 'Lütfen ebeveyn birliktelik durumunu seçiniz.' },
      { name: 'family_structure', fieldId: 'qg-family', msg: 'Lütfen aile yapısını seçiniz.' }
    ];
    for (const item of demoRadios) {
      if (!document.querySelector(`input[name="${item.name}"]:checked`)) {
        errors.push({ fieldId: item.fieldId, message: item.msg });
        return errors;
      }
    }
    // Caregivers
    if (document.querySelectorAll('input[name="caregivers"]:checked').length === 0) {
      errors.push({ fieldId: 'qg-caregivers', message: 'Lütfen en az bir bakım veren kişi seçiniz.' });
      return errors;
    }
  }

  if (sectionId === 'scale1-section') {
    for (let i = 1; i <= SCALE1_QUESTIONS.length; i++) {
      if (!document.querySelector(`input[name="s1_q${i}"]:checked`)) {
        errors.push({ fieldId: `li-s1_q${i}`, message: `Eş Bağımlılık Ölçeği: Lütfen ${i}. soruyu yanıtlayınız.` });
        return errors;
      }
    }
  }

  if (sectionId === 'scale2-section') {
    for (let i = 1; i <= SCALE2_QUESTIONS.length; i++) {
      if (!document.querySelector(`input[name="s2_q${i}"]:checked`)) {
        errors.push({ fieldId: `li-s2_q${i}`, message: `Yakın İlişkiler Envanteri: Lütfen ${i}. soruyu yanıtlayınız.` });
        return errors;
      }
    }
  }

  if (sectionId === 'scale3-section') {
    for (let i = 1; i <= SCALE3_QUESTIONS.length; i++) {
      if (!document.querySelector(`input[name="s3_q${i}"]:checked`)) {
        errors.push({ fieldId: `li-s3_q${i}`, message: `Çocukluk Yaşantıları Ölçeği: Lütfen ${i}. soruyu yanıtlayınız.` });
        return errors;
      }
    }
  }

  return errors;
}

/* ============================================
   PROGRESS BAR (section-based)
   ============================================ */
function updateProgressBar() {
  const bar = document.getElementById('progress-bar');
  const total = SECTION_IDS.length;
  const progress = ((currentSectionIndex + 1) / total) * 100;
  bar.style.width = progress + '%';
}

/* ============================================
   RENDER: Consent Text
   ============================================ */
function renderConsentText() {
  const block = document.getElementById('consent-text-block');
  let html = '';
  CONSENT_PARAGRAPHS.forEach(p => { html += `<p>${p}</p>`; });
  html += `<p class="contact-info">${CONSENT_CONTACT}</p>`;
  html += '<p><strong>Araştırmaya katkıda bulunduğunuz için teşekkür ederiz.</strong></p>';
  block.innerHTML = html;
}

/* ============================================
   RENDER: Debriefing Text
   ============================================ */
function renderDebriefingText() {
  document.getElementById('debriefing-text').innerHTML = DEBRIEFING_HTML;
}

/* ============================================
   RENDER: Demographics Section
   ============================================ */
function renderDemographics() {
  const container = document.getElementById('demographics-container');
  let html = '';

  DEMOGRAPHICS.forEach(q => {
    const reqMark = q.required ? '<span class="required-marker">*</span>' : '';
    const noteText = q.legendNote ? ` <em>${q.legendNote}</em>` : '';
    html += `<fieldset class="question-group" id="qg-${q.id}">`;
    html += `<legend>${q.legend}${noteText} ${reqMark}</legend>`;

    if (q.type === 'email') {
      html += `<div class="input-group">`;
      html += `<input type="email" name="${q.name}" id="${q.id}-input" ${q.required ? 'required' : ''} placeholder="${q.placeholder || ''}" autocomplete="email">`;
      html += `</div>`;
    } else if (q.type === 'radio') {
      html += `<div class="radio-group">`;
      q.options.forEach(opt => {
        html += `<label class="radio-label">`;
        html += `<input type="radio" name="${q.name}" value="${opt}" ${q.required ? 'required' : ''}>`;
        html += `<span class="radio-custom"></span><span class="radio-text">${opt}</span></label>`;
      });
      if (q.hasOther) {
        html += `<label class="radio-label other-option">`;
        html += `<input type="radio" name="${q.name}" value="Diğer" id="${q.id}-other-radio">`;
        html += `<span class="radio-custom"></span><span class="radio-text">Diğer:</span>`;
        html += `<input type="text" name="${q.otherName}" class="other-input" id="${q.id}-other-text" placeholder="Belirtiniz..." disabled>`;
        html += `</label>`;
      }
      html += `</div>`;
    } else if (q.type === 'checkbox') {
      html += `<div class="checkbox-group">`;
      q.options.forEach(opt => {
        html += `<label class="checkbox-label">`;
        html += `<input type="checkbox" name="${q.name}" value="${opt}">`;
        html += `<span class="checkbox-custom"></span><span class="checkbox-text">${opt}</span></label>`;
      });
      if (q.hasOther) {
        html += `<label class="checkbox-label other-option">`;
        html += `<input type="checkbox" name="${q.name}" value="Diğer" id="${q.id}-other-check">`;
        html += `<span class="checkbox-custom"></span><span class="checkbox-text">Diğer:</span>`;
        html += `<input type="text" name="${q.otherName}" class="other-input" id="${q.id}-other-text" placeholder="Belirtiniz..." disabled>`;
        html += `</label>`;
      }
      html += `</div>`;
    }

    html += `</fieldset>`;
  });

  container.innerHTML = html;
}

/* ============================================
   RENDER: Scale Instructions
   ============================================ */
function renderScaleInstructions() {
  document.getElementById('scale1-instructions').textContent =
    'Aşağıdaki soruları okuyarak size uygun gelen seçeneği gösteren rakamı işaretleyiniz. Doğru ya da yanlış cevap yoktur. Lütfen içinizden gelen fikri işaretleyiniz ve 25 sorunun hepsini okuyup işaretlediğinizden emin olunuz.';

  document.getElementById('scale2-instructions').innerHTML =
    'Aşağıdaki maddeler romantik ilişkilerinizde hissettiğiniz duygularla ilgilidir. Bu araştırmada sizin ilişkinizde yalnızca şu anda değil, genel olarak neler olduğuyla ya da neler yaşadığınızla ilgilenmekteyiz. Maddelerde sözü geçen <strong>"birlikte olduğum kişi"</strong> ifadesi ile romantik ilişkide bulunduğunuz kişi kastedilmektedir.';

  document.getElementById('scale2-instructions2').textContent =
    'Her bir maddenin ilişkilerinizdeki duygu ve düşüncelerinizi ne oranda yansıttığını karşılarındaki 7 aralıklı ölçek üzerinde, ilgili rakamı seçerek gösteriniz.';

  document.getElementById('scale3-instructions').innerHTML =
    'Aşağıda verilen ifadeleri <strong>18 yaşından önceki</strong> yaşantılarınıza/duygularınıza göre cevaplandırın.';
}

/* ============================================
   RENDER: Scale Legends
   ============================================ */
function renderScaleLegends() {
  renderLegend('scale1-legend', SCALE1_LABELS, 5);
  renderLegend('scale2-legend', SCALE2_LABELS, 7);
  renderLegend('scale3-legend', SCALE3_LABELS, 5);
}

function renderLegend(containerId, labels, points) {
  const container = document.getElementById(containerId);
  let html = '';
  for (let i = 1; i <= points; i++) {
    const text = labels[i] || '';
    html += `<div class="legend-item"><span class="legend-num">${i}</span> ${text}</div>`;
  }
  container.innerHTML = html;
}

/* ============================================
   LIKERT SCALE GENERATOR
   ============================================ */
function renderLikertScale(containerId, questions, points, edgeLabels, prefix) {
  const container = document.getElementById(containerId);
  let html = '';

  questions.forEach((text, index) => {
    const qNum = index + 1;
    const fieldName = `${prefix}_q${qNum}`;

    html += `<div class="likert-item" id="li-${fieldName}">`;
    html += `<div class="likert-question">`;
    html += `<span class="likert-question-num">${qNum}.</span>`;
    html += `<span class="likert-question-text">${text}</span>`;
    html += `</div>`;
    html += `<div class="likert-options ${points === 7 ? 'likert-options-7' : ''}">`;

    for (let i = 1; i <= points; i++) {
      const edgeLabel = (i === 1 || i === points || edgeLabels[i]) ? (edgeLabels[i] || '') : '';
      html += `<label class="likert-option">`;
      html += `<input type="radio" name="${fieldName}" value="${i}" required>`;
      html += `<span class="likert-circle">${i}</span>`;
      html += `<span class="likert-edge-label">${edgeLabel}</span>`;
      html += `</label>`;
    }

    html += `</div></div>`;
  });

  container.innerHTML = html;
}

/* ============================================
   DISQUALIFICATION LOGIC
   ============================================ */
function setupDisqualificationListeners() {
  // Consent disqualification
  document.querySelectorAll('input[name="consent"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'Kabul etmiyorum') {
        disqualify('disqualified-consent');
      }
    });
  });

  // Relationship status disqualification (event delegation for dynamic content)
  document.getElementById('demographics-container').addEventListener('change', (e) => {
    if (e.target.name === 'relationship_status' && e.target.value === 'Hayır') {
      disqualify('disqualified-relationship');
    }
  });
}

function disqualify(messageId) {
  const main = document.getElementById('survey-main');
  const message = document.getElementById(messageId);
  const progress = document.getElementById('progress-container');

  // Submit the currently collected data (disqualification record)
  submitPartialData();

  if (main) {
    main.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    main.style.opacity = '0';
    main.style.transform = 'translateY(-10px)';

    setTimeout(() => {
      // Remove form from DOM to prevent bypass via inspect element or back/forward cache
      main.remove();
      progress.style.display = 'none';
      message.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  }
}

function submitPartialData() {
  const data = collectFormData();
  fetch(SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data)
  }).catch(e => console.error('Disqualification data send error:', e));
}

// Prevent Back/Forward Cache bypass
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});

/* ============================================
   "OTHER" FIELD TOGGLE
   ============================================ */
function setupOtherFieldListeners() {
  // Checkbox "other"
  document.querySelectorAll('.checkbox-group').forEach(group => {
    const otherCheck = group.querySelector('[id$="-other-check"]');
    const otherText = group.querySelector('[id$="-other-text"]');
    if (otherCheck && otherText) {
      otherCheck.addEventListener('change', () => {
        otherText.disabled = !otherCheck.checked;
        if (otherCheck.checked) otherText.focus();
        else otherText.value = '';
      });
    }
  });

  // Radio "other"
  document.querySelectorAll('.radio-group').forEach(group => {
    const otherRadio = group.querySelector('[id$="-other-radio"]');
    const otherText = group.querySelector('[id$="-other-text"]');
    if (otherRadio && otherText) {
      group.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
          otherText.disabled = !otherRadio.checked;
          if (otherRadio.checked) otherText.focus();
          else otherText.value = '';
        });
      });
    }
  });
}

/* ============================================
   FORM SUBMISSION
   ============================================ */
function setupFormSubmission() {
  const form = document.getElementById('survey-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Collect data
    const data = collectFormData();

    // Show spinner
    const btn = document.getElementById('submit-btn');
    const btnText = btn.querySelector('.btn-text');
    const spinner = document.getElementById('btn-spinner');
    btn.disabled = true;
    btnText.textContent = 'Gönderiliyor...';
    spinner.classList.remove('hidden');

    // Send to Google Apps Script
    fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(result => {
      showThankYou();
    })
    .catch(error => {
      console.error('Submission error:', error);
      showThankYou();
    });
  });
}

/* ============================================
   COLLECT FORM DATA
   ============================================ */
function collectFormData() {
  const data = {};

  data.timestamp = new Date().toISOString();

  // Email
  const emailEl = document.querySelector('input[name="email"]');
  if (emailEl) data.email = emailEl.value;

  // Radio fields
  ['consent', 'age', 'gender', 'education', 'relationship_status',
   'relationship_type', 'relationship_duration', 'parents_marital', 'family_structure'
  ].forEach(name => {
    const checked = document.querySelector(`input[name="${name}"]:checked`);
    data[name] = checked ? checked.value : '';
  });

  // "Other" text fields
  const parentsOther = document.getElementById('parents-other-text');
  data.parents_marital_other = parentsOther ? parentsOther.value || '' : '';

  const familyOther = document.getElementById('family-other-text');
  data.family_structure_other = familyOther ? familyOther.value || '' : '';

  // Caregivers (checkbox)
  const checkedCaregivers = document.querySelectorAll('input[name="caregivers"]:checked');
  data.caregivers = Array.from(checkedCaregivers).map(cb => cb.value).join(', ');

  const caregiversOther = document.getElementById('caregivers-other-text');
  data.caregivers_other = caregiversOther ? caregiversOther.value || '' : '';

  // Scale 1
  for (let i = 1; i <= SCALE1_QUESTIONS.length; i++) {
    const checked = document.querySelector(`input[name="s1_q${i}"]:checked`);
    data[`s1_q${i}`] = checked ? checked.value : '';
  }

  // Scale 2
  for (let i = 1; i <= SCALE2_QUESTIONS.length; i++) {
    const checked = document.querySelector(`input[name="s2_q${i}"]:checked`);
    data[`s2_q${i}`] = checked ? checked.value : '';
  }

  // Scale 3
  for (let i = 1; i <= SCALE3_QUESTIONS.length; i++) {
    const checked = document.querySelector(`input[name="s3_q${i}"]:checked`);
    data[`s3_q${i}`] = checked ? checked.value : '';
  }

  return data;
}

/* ============================================
   SHOW THANK-YOU
   ============================================ */
function showThankYou() {
  const main = document.getElementById('survey-main');
  const thankYou = document.getElementById('thank-you');
  const progress = document.getElementById('progress-container');

  main.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  main.style.opacity = '0';
  main.style.transform = 'translateY(-10px)';

  setTimeout(() => {
    main.style.display = 'none';
    progress.style.display = 'none';
    thankYou.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 300);
}

/* ============================================
   VALIDATION TOAST
   ============================================ */
function showToast(message) {
  const toast = document.getElementById('validation-toast');
  const toastMsg = document.getElementById('toast-message');
  toastMsg.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 4000);
}
