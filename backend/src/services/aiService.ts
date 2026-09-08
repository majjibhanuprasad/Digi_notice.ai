/**
 * AI Service Mock for DigiNotice AI
 * Simulates intelligent generative AI services for notices, targeting, safety checks, translation, and notice-based Q&A.
 */

interface GenerateNoticeInput {
  topic: string;
  description?: string;
  date?: string;
  time?: string;
  venue?: string;
  department?: string;
  academicYear?: string;
  category?: string;
  deadline?: string;
  registrationLink?: string;
}

export const generateNotice = (input: GenerateNoticeInput) => {
  const {
    topic,
    description = '',
    date = '',
    time = '',
    venue = '',
    department = 'All Departments',
    academicYear = 'All Students',
    category = 'General',
    deadline = '',
    registrationLink = ''
  } = input;

  // Build a formal and highly professional college notice body based on input
  let generatedTitle = `Notification: ${topic}`;
  if (topic.toLowerCase().includes('placement') || topic.toLowerCase().includes('infosys') || topic.toLowerCase().includes('hiring')) {
    generatedTitle = `🎓 Campus Placement Drive: ${topic}`;
  } else if (topic.toLowerCase().includes('exam') || topic.toLowerCase().includes('timetable') || topic.toLowerCase().includes('mid')) {
    generatedTitle = `📝 Important Announcement: Academic Examinations (${topic})`;
  } else if (topic.toLowerCase().includes('workshop') || topic.toLowerCase().includes('seminar') || topic.toLowerCase().includes('hackathon')) {
    generatedTitle = `🚀 Technical Event: ${topic}`;
  } else if (topic.toLowerCase().includes('closed') || topic.toLowerCase().includes('holiday') || topic.toLowerCase().includes('weather')) {
    generatedTitle = `⚠️ EMERGENCY BROADCAST: ${topic}`;
  }

  let generatedBody = `Dear Students,\n\n`;
  generatedBody += `This is to inform you that the college is organizing/conducting a program regarding "${topic}".\n\n`;
  if (description) {
    generatedBody += `Details: ${description}\n\n`;
  }
  
  generatedBody += `Please note the schedule and event details below:\n`;
  if (date) generatedBody += `• Date of Event: ${date}\n`;
  if (time) generatedBody += `• Time: ${time}\n`;
  if (venue) generatedBody += `• Venue / Location: ${venue}\n`;
  if (department) generatedBody += `• Eligible Departments: ${department}\n`;
  if (academicYear) generatedBody += `• Target Batches: ${academicYear}\n`;
  if (deadline) generatedBody += `• Registration Deadline: ${deadline}\n`;
  if (registrationLink) generatedBody += `• Registration URL: ${registrationLink}\n`;
  
  generatedBody += `\nInterested and eligible students are requested to complete their registration before the deadline. For any queries, please reach out to the respective department coordinators.\n\n`;
  generatedBody += `Sincerely,\n`;
  generatedBody += `Office of Student Affairs & Academic Administration`;

  const summary = `Official notice regarding "${topic}" scheduled for ${date || 'upcoming dates'} targeting ${academicYear} (${department}) students. ${deadline ? 'Deadline is ' + deadline + '.' : ''}`;

  // Smart suggestions
  let priority: 'CRITICAL' | 'HIGH' | 'NORMAL' = 'NORMAL';
  if (topic.toLowerCase().includes('closed') || topic.toLowerCase().includes('weather') || topic.toLowerCase().includes('holiday') || topic.toLowerCase().includes('emergency')) {
    priority = 'CRITICAL';
  } else if (topic.toLowerCase().includes('exam') || topic.toLowerCase().includes('placement') || topic.toLowerCase().includes('drive') || deadline) {
    priority = 'HIGH';
  }

  let suggestedCategory = category;
  if (topic.toLowerCase().includes('placement') || topic.toLowerCase().includes('job') || topic.toLowerCase().includes('infosys')) {
    suggestedCategory = 'Placements';
  } else if (topic.toLowerCase().includes('exam') || topic.toLowerCase().includes('test') || topic.toLowerCase().includes('mid')) {
    suggestedCategory = 'Exams';
  } else if (topic.toLowerCase().includes('workshop') || topic.toLowerCase().includes('seminar') || topic.toLowerCase().includes('webinar')) {
    suggestedCategory = 'Workshops';
  } else if (topic.toLowerCase().includes('sports') || topic.toLowerCase().includes('cricket') || topic.toLowerCase().includes('tournament')) {
    suggestedCategory = 'Sports';
  } else if (topic.toLowerCase().includes('weather') || topic.toLowerCase().includes('rain') || topic.toLowerCase().includes('closed')) {
    suggestedCategory = 'Emergency';
  }

  const notificationMessage = `New ${priority} Notice: ${topic} has been posted. Read details on the notice board.`;

  return {
    title: generatedTitle,
    content: generatedBody,
    summary,
    category: suggestedCategory,
    priority,
    targetAudience: `${department} - ${academicYear}`,
    importantDates: date ? [date] : [],
    notificationMessage
  };
};

export const recommendTarget = (content: string, title: string) => {
  const fullText = `${title} ${content}`.toLowerCase();
  
  // Recommend Department
  let department = null;
  if (fullText.includes('csm') || fullText.includes('artificial intelligence') || fullText.includes('ai/ml')) {
    department = 'CSM';
  } else if (fullText.includes('csd') || fullText.includes('data science')) {
    department = 'CSD';
  } else if (fullText.includes('cse') || fullText.includes('computer science')) {
    department = 'CSE';
  } else if (fullText.includes('ece') || fullText.includes('electronics')) {
    department = 'ECE';
  } else if (fullText.includes('eee') || fullText.includes('electrical')) {
    department = 'EEE';
  } else if (fullText.includes('mech') || fullText.includes('mechanical')) {
    department = 'Mech';
  } else if (fullText.includes('civil')) {
    department = 'Civil';
  } else if (fullText.includes('it') || fullText.includes('information technology')) {
    department = 'IT';
  } else if (fullText.includes('robotics')) {
    department = 'Robotics';
  } else if (fullText.includes('chemical')) {
    department = 'Chemical Engineering';
  } else if (fullText.includes('cyber') || fullText.includes('security')) {
    department = 'Cyber Security';
  } else if (fullText.includes('bio') || fullText.includes('biotech')) {
    department = 'Bio Technology';
  } else if (fullText.includes('aero') || fullText.includes('aerospace')) {
    department = 'Aero Space';
  } else if (fullText.includes('agri') || fullText.includes('agriculture') || fullText.includes('agricultural')) {
    department = 'Agricultural Engineering';
  } else if (fullText.includes('mining')) {
    department = 'Mining Engineering';
  }

  // Recommend Academic Years
  const academicYears: string[] = [];
  if (fullText.includes('1st year') || fullText.includes('first year') || fullText.includes('freshers')) {
    academicYears.push('1st Year');
  }
  if (fullText.includes('2nd year') || fullText.includes('second year') || fullText.includes('sophomores')) {
    academicYears.push('2nd Year');
  }
  if (fullText.includes('3rd year') || fullText.includes('third year') || fullText.includes('juniors')) {
    academicYears.push('3rd Year');
  }
  if (fullText.includes('4th year') || fullText.includes('fourth year') || fullText.includes('final year') || fullText.includes('graduating')) {
    academicYears.push('4th Year');
  }
  // Default to all if empty
  if (academicYears.length === 0) {
    academicYears.push('1st Year', '2nd Year', '3rd Year', '4th Year');
  }

  // Recommend Category
  let category = 'General';
  if (fullText.includes('placement') || fullText.includes('recruit') || fullText.includes('interview') || fullText.includes('job') || fullText.includes('hiring')) {
    category = 'Placements';
  } else if (fullText.includes('exam') || fullText.includes('timetable') || fullText.includes('test') || fullText.includes('quiz') || fullText.includes('hall ticket')) {
    category = 'Exams';
  } else if (fullText.includes('workshop') || fullText.includes('seminar') || fullText.includes('symposium') || fullText.includes('bootcamp')) {
    category = 'Workshops';
  } else if (fullText.includes('sport') || fullText.includes('cricket') || fullText.includes('football') || fullText.includes('sports')) {
    category = 'Sports';
  } else if (fullText.includes('cultural') || fullText.includes('fest') || fullText.includes('music') || fullText.includes('dance') || fullText.includes('club')) {
    category = 'Cultural';
  } else if (fullText.includes('emergency') || fullText.includes('closed') || fullText.includes('holiday due to') || fullText.includes('cyclone') || fullText.includes('weather')) {
    category = 'Emergency';
  }

  // Target groups (student clubs or interest groups)
  const targetGroups: string[] = [];
  if (fullText.includes('coding') || fullText.includes('hackathon')) {
    targetGroups.push('Coding Club');
  }
  if (fullText.includes('sports') || fullText.includes('tournament') || fullText.includes('cricket')) {
    targetGroups.push('Sports Club');
  }
  if (fullText.includes('placements') || fullText.includes('career')) {
    targetGroups.push('Placement Cell');
  }
  if (fullText.includes('cultural') || fullText.includes('fest') || fullText.includes('music') || fullText.includes('drama')) {
    targetGroups.push('Cultural Society');
  }

  return {
    department,
    academicYears,
    category,
    targetGroups
  };
};

export const checkContent = (content: string, title: string, metadata: any = {}) => {
  const fullText = `${title} ${content}`;
  const warnings: string[] = [];
  let score = 100;

  // 1. Offensive Language Check
  const offensiveWords = ['spam', 'abuse', 'stupid', 'idiot', 'damn', 'kill', 'die', 'cheat', 'hack'];
  const foundOffensive = offensiveWords.filter(word => fullText.toLowerCase().includes(word));
  if (foundOffensive.length > 0) {
    warnings.push(`Contains unprofessional or potentially inappropriate language: "${foundOffensive.join(', ')}".`);
    score -= 25;
  }

  // 2. Missing Registration Link warning for Placements/Events
  if (
    (title.toLowerCase().includes('placement') || title.toLowerCase().includes('register') || title.toLowerCase().includes('workshop')) && 
    !fullText.toLowerCase().includes('http') && 
    !fullText.toLowerCase().includes('www.') &&
    !metadata.registrationLink
  ) {
    warnings.push('Registration link seems to be missing for this placement/event notice.');
    score -= 15;
  }

  // 3. Expiry Date Check
  if (!metadata.expiresAt) {
    warnings.push('Notice is missing an expiration/expiry date.');
    score -= 15;
  }

  // 4. Missing Date Check
  const dateRegex = /\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4}/;
  const wordMonthRegex = /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}/i;
  if (!dateRegex.test(fullText) && !wordMonthRegex.test(fullText) && !metadata.eventDate) {
    warnings.push('No event date or deadline date was detected in the notice text.');
    score -= 15;
  }

  // 5. Short content check
  if (content.length < 50) {
    warnings.push('The notice description is very short and may lack important context.');
    score -= 10;
  }

  // Ensure score doesn't drop below 0
  score = Math.max(0, score);

  return {
    score,
    warnings,
    approved: score >= 70
  };
};

export const generateSummary = (content: string) => {
  // Extract key lines or build a concise summary from text
  const cleanContent = content.replace(/\n+/g, ' ').trim();
  const sentences = cleanContent.split(/[.!?]+/);
  
  let keyDetails = '';
  // Look for dates or actions in sentences
  const actionSentences = sentences.filter(s => 
    s.toLowerCase().includes('register') || 
    s.toLowerCase().includes('deadline') || 
    s.toLowerCase().includes('held on') ||
    s.toLowerCase().includes('exam') ||
    s.toLowerCase().includes('closed')
  );

  if (actionSentences.length > 0) {
    keyDetails = actionSentences[0].trim();
  } else {
    keyDetails = sentences[0].trim();
  }

  if (keyDetails.length > 120) {
    keyDetails = keyDetails.substring(0, 117) + '...';
  }

  return `🧠 AI Summary: ${keyDetails || 'Please refer to the full notice body for details.'}`;
};

export const translateNotice = (content: string, targetLanguage: string) => {
  // Simple translations for key notices, fallback to a structured translated string
  const translations: Record<string, Record<string, string>> = {
    telugu: {
      "college closed today due to severe weather": "తీవ్రమైన వాతావరణం కారణంగా ఈరోజు కళాశాల మూసివేయబడింది.",
      "placement drive for cse 4th-year students": "సీఎస్ఈ 4వ సంవత్సరం విద్యార్థుల కోసం ప్లేస్‌మెంట్ డ్రైవ్.",
      "infosys placement drive for cse and ece final-year students on august 25": "ఆగస్టు 25న సీఎస్ఈ మరియు ఈసీఈ చివరి సంవత్సర విద్యార్థుల కోసం ఇన్ఫోసిస్ ప్లేస్‌మెంట్ డ్రైవ్.",
      "dear students": "ప్రియమైన విద్యార్థులకు,",
      "sincerely": "భవదీయుడు,",
      "final-year cse and ece students can register for the infosys placement drive by august 22": "చివరి సంవత్సర సీఎస్ఈ మరియు ఈసీఈ విద్యార్థులు ఆగస్టు 22 లోపు ఇన్ఫోసిస్ ప్లేస్‌మెంట్ డ్రైవ్ కోసం నమోదు చేసుకోవచ్చు."
    },
    hindi: {
      "college closed today due to severe weather": "खराब मौसम के कारण आज कॉलेज बंद रहेगा।",
      "placement drive for cse 4th-year students": "सीएसई चतुर्थ वर्ष के छात्रों के लिए प्लेसमेंट ड्राइव।",
      "infosys placement drive for cse and ece final-year students on august 25": "25 अगस्त को सीएसई और ईसीई अंतिम वर्ष के छात्रों के लिए इंफोसिस प्लेसमेंट ड्राइव।",
      "dear students": "प्रिय छात्रों,",
      "sincerely": "भवदीय,",
      "final-year cse and ece students can register for the infosys placement drive by august 22": "अंतिम वर्ष के सीएसई और ईसीई छात्र 22 अगस्त तक इंफोसिस प्लेसमेंट ड्राइव के लिए पंजीकरण कर सकते हैं।"
    },
    tamil: {
      "college closed today due to severe weather": "கடுமையான வானிலை காரணமாக இன்று கல்லூரி மூடப்பட்டுள்ளது.",
      "placement drive for cse 4th-year students": "சிஎஸ்இ 4 ஆம் ஆண்டு மாணவர்களுக்கான வேலைவாய்ப்பு முகாம்.",
      "infosys placement drive for cse and ece final-year students on august 25": "ஆகஸ்ட் 25 அன்று சிஎஸ்இ மற்றும் இசிஇ இறுதி ஆண்டு மாணவர்களுக்கான இன்ஃபோசிஸ் வேலைவாய்ப்பு முகாம்.",
      "dear students": "அன்பான மாணவர்களுக்கு,",
      "sincerely": "இப்படிக்கு,",
      "final-year cse and ece students can register for the infosys placement drive by august 22": "இறுதி ஆண்டு சிஎஸ்இ மற்றும் இசிஇ மாணவர்கள் ஆகஸ்ட் 22க்குள் இன்ஃபோசிஸ் வேலைவாய்ப்பு முகாமிற்கு பதிவு செய்யலாம்."
    },
    kannada: {
      "college closed today due to severe weather": "ಪ್ರತಿಕೂಲ ಹವಾಮಾನದ ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಇಂದು ಕಾಲೇಜಿಗೆ ರಜೆ ಘೋಷಿಸಲಾಗಿದೆ.",
      "placement drive for cse 4th-year students": "ಸಿಎಸ್ಇ 4ನೇ ವರ್ಷದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಉದ್ಯೋಗ ಮೇಳ.",
      "infosys placement drive for cse and ece final-year students on august 25": "ಆಗಸ್ಟ್ 25 ರಂದು ಸಿಎಸ್ಇ ಮತ್ತು ಈಸಿಇ ಅಂತಿಮ ವರ್ಷದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಇನ್ಫೋಸಿಸ್ ಕ್ಯಾಂಪಸ್ ಉದ್ಯೋಗ ಮೇಳ.",
      "dear students": "ಪ್ರೀತಿಯ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ,",
      "sincerely": "ನಿಮ್ಮ ನಂಬಿಕೆಯ,",
      "final-year cse and ece students can register for the infosys placement drive by august 22": "ಅಂತಿಮ ವರ್ಷದ ಸಿಎಸ್ಇ ಮತ್ತು ಈಸಿಇ ವಿದ್ಯಾರ್ಥಿಗಳು ಆಗಸ್ಟ್ 22 ರೊಳಗೆ ಇನ್ಫೋಸಿಸ್ ಉದ್ಯೋಗ ಮೇಳಕ್ಕೆ ನೋಂದಾಯಿಸಿಕೊಳ್ಳಬಹುದು."
    }
  };

  const lang = targetLanguage.toLowerCase();
  if (!['telugu', 'hindi', 'tamil', 'kannada'].includes(lang)) {
    return `[Translated to ${targetLanguage}]: ${content}`;
  }

  // Iterate over sentences and translate matched phrases, otherwise output stylized translation block
  let translatedText = content;
  const dictionary = translations[lang];

  // Try to do translation sentence by sentence or simple text replacements
  let foundTranslation = false;
  for (const [englishKey, translationValue] of Object.entries(dictionary)) {
    const regex = new RegExp(englishKey, 'gi');
    if (regex.test(translatedText)) {
      translatedText = translatedText.replace(regex, translationValue);
      foundTranslation = true;
    }
  }

  if (!foundTranslation) {
    // If no direct matches, return a simulated translation block of the notice
    const firstLines = content.split('\n').slice(0, 3).join(' ');
    const placeholderText: Record<string, string> = {
      telugu: `[తెలుగు అనువాదం]: ఈ నోటీసు కళాశాల అధికారిక సమాచారం గురించి. దయచేసి వివరాల కోసం అసలు ఇంగ్లీష్ వెర్షన్‌ను చూడండి. సారాంశం: "${firstLines.substring(0, 80)}..."`,
      hindi: `[हिंदी अनुवाद]: यह नोटिस कॉलेज की आधिकारिक जानकारी के बारे में है। कृपया विवरण के लिए मूल अंग्रेजी संस्करण देखें। सारांश: "${firstLines.substring(0, 80)}..."`,
      tamil: `[தமிழ் மொழிபெயர்ப்பு]: இந்த அறிவிப்பு கல்லூரியின் அதிகாரப்பூர்வ தகவலைப் பற்றியது. விவரங்களுக்கு அசல் ஆங்கிலப் பதிப்பைப் பார்க்கவும். சுருக்கம்: "${firstLines.substring(0, 80)}..."`,
      kannada: `[ಕನ್ನಡ ಅನುವಾದ]: ಈ ನೋಟಿಸ್ ಕಾಲೇಜಿನ ಅಧಿಕೃತ ಮಾಹಿತಿಯ ಬಗ್ಗೆಯಾಗಿದೆ. ವಿವರಗಳಿಗಾಗಿ ದಯವಿಟ್ಟು ಮೂಲ ಇಂಗ್ಲಿಷ್ ಆವೃತ್ತಿಯನ್ನು ನೋಡಿ. ಸಾರಾಂಶ: "${firstLines.substring(0, 80)}..."`
    };
    return placeholderText[lang];
  }

  return translatedText;
};

export const askNoticeAI = (notice: any, question: string): string => {
  const q = question.toLowerCase().trim();
  const title = (notice.title || '').toLowerCase();
  const content = (notice.content || '').toLowerCase();
  const summary = (notice.summary || '').toLowerCase();
  const fullText = `${title} ${content} ${summary}`;

  // Helper to extract registration link
  if (q.includes('registration link') || q.includes('how to register') || q.includes('link') || q.includes('register')) {
    if (notice.registrationLink) {
      return `The registration link mentioned in the notice is: ${notice.registrationLink}`;
    }
    const linkMatch = content.match(/https?:\/\/[^\s]+/);
    if (linkMatch) {
      return `You can register using the link in the notice: ${linkMatch[0]}`;
    }
    return `I couldn't find a registration link in this notice. Please contact the coordinator for registration details.`;
  }

  // Helper to extract deadline
  if (q.includes('deadline') || q.includes('last date') || q.includes('when to register')) {
    const deadlineKeywords = ['deadline', 'last date', 'register by', 'till'];
    // Look for lines containing deadline
    const lines = notice.content.split('\n');
    for (const line of lines) {
      if (deadlineKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        return `The deadline details found in the notice are: "${line.trim()}"`;
      }
    }
    if (notice.expiresAt) {
      const expDate = new Date(notice.expiresAt).toLocaleDateString('en-US', { dateStyle: 'long' });
      return `The notice is valid and expires on ${expDate}. A specific registration deadline is not explicitly highlighted, but it must be completed before expiry.`;
    }
    return `I couldn't find a registration deadline mentioned in this notice.`;
  }

  // Helper to check eligibility
  if (q.includes('eligible') || q.includes('eligibility') || q.includes('who can') || q.includes('qualification') || q.includes('audience')) {
    if (notice.academicYears && notice.academicYears.length > 0) {
      const depts = notice.department ? `${notice.department}` : 'all departments';
      const years = notice.academicYears.join(', ');
      return `According to the notice eligibility, students from **${depts}** of the following academic years are eligible: **${years}** ${notice.targetGroups?.length > 0 ? '(specifically: ' + notice.targetGroups.join(', ') + ')' : ''}.`;
    }
    return `The notice states it targets ${notice.department || 'all'} departments and ${notice.academicYears?.join(', ') || 'all'} academic years.`;
  }

  // Helper to check venue / where
  if (q.includes('venue') || q.includes('where') || q.includes('location') || q.includes('place')) {
    if (notice.venue) {
      return `The event location/venue specified in the notice is: **${notice.venue}**`;
    }
    const venueKeywords = ['venue', 'location', 'held at', 'seminar hall', 'auditorium', 'room'];
    const lines = notice.content.split('\n');
    for (const line of lines) {
      if (venueKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        return `Location details found in the notice: "${line.trim()}"`;
      }
    }
    return `I couldn't find the location/venue information in this notice.`;
  }

  // Helper to check date / when
  if (q.includes('date') || q.includes('when is') || q.includes('time') || q.includes('schedule')) {
    if (notice.eventDate) {
      const evDate = new Date(notice.eventDate).toLocaleDateString('en-US', { dateStyle: 'full' });
      return `The event is scheduled on **${evDate}**${notice.content.toLowerCase().includes('am') || notice.content.toLowerCase().includes('pm') ? '. Check notice details for time slots.' : ''}`;
    }
    const lines = notice.content.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('date') || line.toLowerCase().includes('time') || line.toLowerCase().includes('schedule')) {
        return `Schedule details from the notice: "${line.trim()}"`;
      }
    }
    return `The notice does not state a specific event date or time in its structured metadata. Please read the notice body closely.`;
  }

  // Helper to check documents required
  if (q.includes('document') || q.includes('resume') || q.includes('certificate') || q.includes('required')) {
    if (fullText.includes('resume') || fullText.includes('cv')) {
      return `The notice suggests that students should keep their resumes/CVs updated for the process.`;
    }
    if (fullText.includes('marksheet') || fullText.includes('cgpa')) {
      return `Students may need to check eligibility criteria and have transcripts ready.`;
    }
    return `I couldn't find list of required documents specified in this notice.`;
  }

  // Generic answer lookup
  const sentences = notice.content.split(/[.!?]+/);
  // Match based on keywords in the question
  const words = q.split(/\s+/).filter(w => w.length > 3);
  let bestMatch = '';
  let maxMatches = 0;

  for (const sentence of sentences) {
    let matches = 0;
    for (const word of words) {
      if (sentence.toLowerCase().includes(word)) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = sentence.trim();
    }
  }

  if (maxMatches > 1) {
    return `Here is what I found regarding your query: "${bestMatch}."`;
  }

  // If information is not present:
  return `I couldn't find that information in this notice.`;
};
