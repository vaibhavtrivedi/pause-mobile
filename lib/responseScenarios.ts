export type ResponseOption = {
  id: string;
  title: string;
  desc: string;
  feedback: string;
};

export type ResponseScenario = {
  id: string;
  category: string;
  situation: string;
  question: string;
  options: ResponseOption[];
};

export const RESPONSE_SCENARIOS: ResponseScenario[] = [
  {
    id: 'interruptions',
    category: 'Communication',
    situation: 'Someone interrupts you repeatedly while you are speaking.',
    question: 'How would you respond?',
    options: [
      {
        id: 'anger',
        title: 'Raise your voice and demand to be heard.',
        desc: 'Make your frustration clear.',
        feedback: 'Raising your voice may turn the conversation into an argument. Try expressing your need firmly without escalating.',
      },
      {
        id: 'pause',
        title: 'Pause and calmly ask to finish speaking.',
        desc: 'Give yourself a moment before responding.',
        feedback: 'You are setting a respectful boundary while keeping the conversation constructive.',
      },
      {
        id: 'withdraw',
        title: 'Stop speaking and walk away.',
        desc: 'Avoid the uncomfortable interaction.',
        feedback: 'Taking space can help when emotions are high. Consider returning later to communicate what you need.',
      },
    ],
  },
  {
    id: 'unfair-criticism',
    category: 'Criticism',
    situation: 'A colleague criticizes your work in front of other people.',
    question: 'What would you do?',
    options: [
      {
        id: 'defend',
        title: 'Immediately defend yourself.',
        desc: 'Explain why they are wrong.',
        feedback: 'Defending yourself immediately can make it harder to understand the feedback. Take a breath and consider the specific point being raised.',
      },
      {
        id: 'clarify',
        title: 'Ask calmly for specific feedback.',
        desc: 'Understand the concern before responding.',
        feedback: 'Asking for specifics helps separate useful feedback from an uncomfortable delivery.',
      },
      {
        id: 'retaliate',
        title: 'Point out their mistakes in return.',
        desc: 'Make the criticism go both ways.',
        feedback: 'Responding with another criticism can escalate tension. You can address their behaviour separately without attacking them.',
      },
    ],
  },
  {
    id: 'hurtful-family-comment',
    category: 'Family',
    situation: 'A family member makes a hurtful comment during a conversation.',
    question: 'How might you respond?',
    options: [
      {
        id: 'attack',
        title: 'Say something equally hurtful.',
        desc: 'Make them understand how it feels.',
        feedback: 'Retaliation may deepen the hurt. Explaining how the comment affected you is more likely to open a useful conversation.',
      },
      {
        id: 'express',
        title: 'Explain calmly that the comment hurt you.',
        desc: 'Communicate your feelings clearly.',
        feedback: 'You are acknowledging your feelings and giving the other person an opportunity to understand your perspective.',
      },
      {
        id: 'ignore',
        title: 'Pretend it did not affect you.',
        desc: 'Avoid discussing the comment.',
        feedback: 'Letting something pass can sometimes be a choice, but repeatedly hiding hurt feelings may build resentment.',
      },
    ],
  },
  {
    id: 'ignored-request',
    category: 'Boundaries',
    situation: 'Someone repeatedly ignores a reasonable request you have made.',
    question: 'What would you do?',
    options: [
      {
        id: 'shout',
        title: 'Shout until they listen.',
        desc: 'Show how frustrated you are.',
        feedback: 'Shouting may get attention temporarily but can damage cooperation. A clear boundary and a calm follow-up may work better.',
      },
      {
        id: 'boundary',
        title: 'Restate your request and explain its importance.',
        desc: 'Be clear about what you need.',
        feedback: 'A clear and respectful request makes your expectations easier to understand.',
      },
      {
        id: 'give-up',
        title: 'Give up and do everything yourself.',
        desc: 'Avoid another disagreement.',
        feedback: 'Taking over may solve the immediate problem, but it can leave the underlying issue unresolved.',
      },
    ],
  },
  {
    id: 'being-blamed',
    category: 'Defensiveness',
    situation: 'Someone blames you for a mistake that was not entirely your responsibility.',
    question: 'How would you handle it?',
    options: [
      {
        id: 'blame-back',
        title: 'Blame the other person immediately.',
        desc: 'Make sure they know it was not just you.',
        feedback: 'Blaming someone back can shift attention away from solving the problem. First establish what actually happened.',
      },
      {
        id: 'facts',
        title: 'Explain your part calmly using facts.',
        desc: 'Separate responsibility from assumptions.',
        feedback: 'A factual explanation helps clarify responsibility without turning the discussion into a personal conflict.',
      },
      {
        id: 'accept-all',
        title: 'Accept all the blame to end the discussion.',
        desc: 'Avoid further disagreement.',
        feedback: 'Taking responsibility is valuable, but accepting responsibility for things you did not do can create unfair expectations.',
      },
    ],
  },
  {
    id: 'traffic-delay',
    category: 'Impatience',
    situation: 'You are stuck in traffic and may arrive late for an important appointment.',
    question: 'What would help you respond?',
    options: [
      {
        id: 'honk',
        title: 'Keep honking and become visibly angry.',
        desc: 'Try to make traffic move faster.',
        feedback: 'Other drivers may not be able to change the situation. Repeated honking adds stress without necessarily helping.',
      },
      {
        id: 'update',
        title: 'Take a breath and inform the person you may be late.',
        desc: 'Focus on what you can control.',
        feedback: 'You cannot control traffic, but you can communicate and make a sensible decision about your next step.',
      },
      {
        id: 'panic',
        title: 'Keep checking the time and worrying.',
        desc: 'Try to calculate every lost minute.',
        feedback: 'Constantly checking the time can increase frustration. A practical update may be more useful.',
      },
    ],
  },
  {
    id: 'work-pressure',
    category: 'Work Stress',
    situation: 'Your manager gives you an urgent task when you already have a full workload.',
    question: 'How would you respond?',
    options: [
      {
        id: 'refuse',
        title: 'Refuse angrily.',
        desc: 'Make it clear you cannot take more work.',
        feedback: 'Your workload concern may be valid, but an angry refusal can make collaboration harder.',
      },
      {
        id: 'prioritize',
        title: 'Discuss priorities and deadlines.',
        desc: 'Clarify what should come first.',
        feedback: 'Discussing priorities helps make workload constraints visible and supports a realistic plan.',
      },
      {
        id: 'overwork',
        title: 'Accept everything without saying anything.',
        desc: 'Try to finish all tasks yourself.',
        feedback: 'Taking on too much silently can lead to exhaustion and missed expectations. Communicating capacity is important.',
      },
    ],
  },
  {
    id: 'slow-service',
    category: 'Impatience',
    situation: 'You have been waiting a long time for service and nobody has updated you.',
    question: 'What would you do?',
    options: [
      {
        id: 'complain-angry',
        title: 'Complain loudly to everyone nearby.',
        desc: 'Show your dissatisfaction.',
        feedback: 'A loud complaint can create unnecessary conflict. Directly asking for an update is more constructive.',
      },
      {
        id: 'ask-update',
        title: 'Politely ask for an update.',
        desc: 'Find out what is happening.',
        feedback: 'A calm, direct question communicates your concern while giving the other person a chance to help.',
      },
      {
        id: 'leave',
        title: 'Leave immediately without checking.',
        desc: 'Avoid wasting more time.',
        feedback: 'Leaving may be reasonable if you have alternatives, but first consider whether a quick update could resolve the uncertainty.',
      },
    ],
  },
  {
    id: 'broken-promise',
    category: 'Expectations',
    situation: 'A friend breaks a promise that was important to you.',
    question: 'How might you respond?',
    options: [
      {
        id: 'accuse',
        title: 'Accuse them of not caring about you.',
        desc: 'Express your disappointment strongly.',
        feedback: 'An accusation may make your friend defensive. Explain what the promise meant to you and how its being broken affected you.',
      },
      {
        id: 'discuss',
        title: 'Talk about your disappointment honestly.',
        desc: 'Explain why it mattered.',
        feedback: 'Honest communication gives both people a chance to understand expectations and discuss what happened.',
      },
      {
        id: 'cut-off',
        title: 'Stop communicating without explanation.',
        desc: 'Protect yourself from disappointment.',
        feedback: 'Taking distance can sometimes be appropriate, but explaining your boundary may prevent confusion.',
      },
    ],
  },
  {
    id: 'public-embarrassment',
    category: 'Self-Control',
    situation: 'Someone makes a joke about you in front of a group, and you feel embarrassed.',
    question: 'What would you do?',
    options: [
      {
        id: 'embarrass-back',
        title: 'Make a joke about them in return.',
        desc: 'Restore your confidence.',
        feedback: 'A counterattack may get a laugh but can turn the moment into a competition. You can respond confidently without humiliating anyone.',
      },
      {
        id: 'assert',
        title: 'Calmly say that the joke was uncomfortable.',
        desc: 'Make your boundary clear.',
        feedback: 'You are standing up for yourself without escalating the situation.',
      },
      {
        id: 'hide',
        title: 'Pretend to laugh even though you feel hurt.',
        desc: 'Avoid drawing attention.',
        feedback: 'Choosing not to react publicly is understandable, but you can still address the comment privately later.',
      },
    ],
  },
  {
    id: 'interrupted-rest',
    category: 'Family',
    situation: 'You finally sit down to rest, but someone asks you to do another task.',
    question: 'How would you respond?',
    options: [
      {
        id: 'snap',
        title: 'Snap at them for disturbing you.',
        desc: 'Show that you need a break.',
        feedback: 'Your need for rest is valid, but snapping can hurt the relationship. Try stating when you can help.',
      },
      {
        id: 'schedule',
        title: 'Explain that you need a break and offer a time.',
        desc: 'Communicate your availability.',
        feedback: 'You are respecting your own needs while giving the other person a clear expectation.',
      },
      {
        id: 'ignore-task',
        title: 'Ignore them completely.',
        desc: 'Continue resting without responding.',
        feedback: 'You may need quiet time, but a brief response can prevent misunderstandings.',
      },
    ],
  },
  {
    id: 'online-argument',
    category: 'Digital Stress',
    situation: 'Someone posts an insulting comment about you online.',
    question: 'What would you do?',
    options: [
      {
        id: 'reply-insult',
        title: 'Reply with an even harsher insult.',
        desc: 'Defend yourself publicly.',
        feedback: 'An angry reply can prolong the conflict and attract more attention. Consider whether responding serves any useful purpose.',
      },
      {
        id: 'pause-report',
        title: 'Pause before deciding whether to respond or report it.',
        desc: 'Avoid reacting impulsively.',
        feedback: 'Taking time gives you a chance to choose a response that protects your wellbeing and privacy.',
      },
      {
        id: 'obsess',
        title: 'Keep rereading the comment.',
        desc: 'Try to understand why they said it.',
        feedback: 'Repeatedly revisiting an insulting comment can keep the frustration alive. Stepping away may help.',
      },
    ],
  },
  {
    id: 'unexpected-change',
    category: 'Flexibility',
    situation: 'A carefully planned day suddenly changes because someone cancels an arrangement.',
    question: 'How would you handle the change?',
    options: [
      {
        id: 'blame-cancel',
        title: 'Tell them they have ruined your day.',
        desc: 'Make your disappointment clear.',
        feedback: 'Your disappointment is understandable, but blaming may not improve the situation. Explain the impact and explore alternatives.',
      },
      {
        id: 'adapt',
        title: 'Take a moment and consider another plan.',
        desc: 'Adjust what you can control.',
        feedback: 'Allowing yourself a moment to adjust can make an unexpected change easier to manage.',
      },
      {
        id: 'cancel-everything',
        title: 'Cancel everything else out of frustration.',
        desc: 'Abandon the original plan.',
        feedback: 'You may need to change your plans, but making every decision while frustrated can create more problems.',
      },
    ],
  },
  {
    id: 'repeated-question',
    category: 'Patience',
    situation: 'Someone asks you the same question for the third time.',
    question: 'What would you do?',
    options: [
      {
        id: 'mock',
        title: 'Make fun of them for not understanding.',
        desc: 'Show your irritation.',
        feedback: 'Mocking can make someone reluctant to ask questions. Try checking whether your explanation was clear.',
      },
      {
        id: 'rephrase',
        title: 'Explain it differently and ask what is unclear.',
        desc: 'Try another approach.',
        feedback: 'Changing your explanation can help identify the misunderstanding without making the other person feel small.',
      },
      {
        id: 'walk',
        title: 'Stop explaining and walk away.',
        desc: 'End the conversation.',
        feedback: 'Taking a break may help if you are frustrated. You can communicate that you would like to continue later.',
      },
    ],
  },
  {
    id: 'unfair-comparison',
    category: 'Self-Worth',
    situation: "Someone compares your progress unfavourably with another person's achievements.",
    question: 'How might you respond?',
    options: [
      {
        id: 'compete',
        title: 'List all the ways you are better than that person.',
        desc: 'Prove your worth.',
        feedback: 'Turning it into a competition may increase pressure. Your progress does not need to be measured against someone else.',
      },
      {
        id: 'boundary',
        title: 'Explain that comparisons are not helpful.',
        desc: 'Bring the conversation back to your goals.',
        feedback: 'You are communicating a boundary and keeping attention on your own progress.',
      },
      {
        id: 'withdraw',
        title: 'Assume you are not good enough.',
        desc: 'Accept the comparison.',
        feedback: "Someone else's progress does not determine your value. Try separating their opinion from the facts about your own journey.",
      },
    ],
  },
  {
    id: 'mistake-at-work',
    category: 'Accountability',
    situation: 'You discover that you made a mistake in an important piece of work.',
    question: 'What would you do first?',
    options: [
      {
        id: 'hide',
        title: 'Hope nobody notices.',
        desc: 'Avoid an uncomfortable conversation.',
        feedback: 'Hiding a mistake can make it harder to fix. Understanding the impact and communicating early is often more useful.',
      },
      {
        id: 'own',
        title: 'Acknowledge it and work on a correction.',
        desc: 'Focus on resolving the issue.',
        feedback: 'Taking responsibility helps build trust and shifts attention towards a solution.',
      },
      {
        id: 'panic',
        title: 'Panic and assume everything is ruined.',
        desc: 'Focus on the worst possible outcome.',
        feedback: 'A mistake deserves attention, but assuming the worst can make problem-solving harder. Start by assessing the actual impact.',
      },
    ],
  },
  {
    id: 'disagreement',
    category: 'Communication',
    situation: 'You strongly disagree with someone during a discussion.',
    question: 'How would you approach the disagreement?',
    options: [
      {
        id: 'interrupt',
        title: 'Interrupt to prove your point.',
        desc: 'Make sure your view is heard.',
        feedback: 'Interrupting can prevent both sides from understanding each other. Letting the other person finish may create a better opening.',
      },
      {
        id: 'listen',
        title: 'Listen fully before explaining your view.',
        desc: 'Understand their reasoning.',
        feedback: 'Listening does not mean agreeing. It helps you respond to what the other person actually means.',
      },
      {
        id: 'dismiss',
        title: 'Dismiss their opinion as nonsense.',
        desc: 'End the disagreement quickly.',
        feedback: 'Dismissing someone can shut down communication. You can disagree firmly without attacking their intelligence.',
      },
    ],
  },
  {
    id: 'queue-jumping',
    category: 'Fairness',
    situation: 'Someone steps ahead of you in a queue after you have been waiting.',
    question: 'What would you do?',
    options: [
      {
        id: 'confront-angry',
        title: 'Confront them aggressively.',
        desc: 'Demand immediate fairness.',
        feedback: 'It is reasonable to expect fairness, but aggression can create unnecessary conflict. A clear, calm reminder may be enough.',
      },
      {
        id: 'speak-up',
        title: 'Politely point out that there is a queue.',
        desc: 'Address the issue directly.',
        feedback: 'A calm reminder communicates your concern while leaving room for an honest mistake.',
      },
      {
        id: 'resent',
        title: 'Say nothing but remain angry.',
        desc: 'Avoid confrontation.',
        feedback: 'Choosing not to confront someone is your choice, but holding onto the frustration may affect the rest of your day.',
      },
    ],
  },
  {
    id: 'noise-at-home',
    category: 'Boundaries',
    situation: 'You are trying to concentrate at home, but people around you are making a lot of noise.',
    question: 'How might you respond?',
    options: [
      {
        id: 'shout-noise',
        title: 'Shout at everyone to be quiet.',
        desc: 'Demand immediate silence.',
        feedback: 'A sudden outburst can create tension. Explaining what you need and agreeing on quiet time may work better.',
      },
      {
        id: 'request-quiet',
        title: 'Ask respectfully for a quieter period.',
        desc: 'Explain what you are trying to do.',
        feedback: 'A specific request gives others a chance to support your need for concentration.',
      },
      {
        id: 'suffer',
        title: 'Say nothing and struggle to concentrate.',
        desc: 'Avoid disturbing anyone.',
        feedback: 'Being considerate is good, but your needs matter too. A respectful request is reasonable.',
      },
    ],
  },
  {
    id: 'slow-teammate',
    category: 'Teamwork',
    situation: 'A teammate is taking longer than expected to complete their part of a shared task.',
    question: 'What would you do?',
    options: [
      {
        id: 'accuse-lazy',
        title: 'Accuse them of being lazy.',
        desc: 'Express your frustration.',
        feedback: 'Assuming the reason may create defensiveness. Ask about progress and whether they need support.',
      },
      {
        id: 'check-in',
        title: 'Check in and discuss the timeline.',
        desc: 'Understand what is causing the delay.',
        feedback: 'A constructive check-in helps identify obstacles and agree on next steps.',
      },
      {
        id: 'take-over',
        title: 'Do their part without discussing it.',
        desc: 'Make sure the task gets finished.',
        feedback: 'Taking over may solve the immediate delay, but it can create an unfair workload and leave the cause unresolved.',
      },
    ],
  },
  {
    id: 'cancelled-plans',
    category: 'Relationships',
    situation: 'A close friend cancels plans with you at the last minute.',
    question: 'How would you respond?',
    options: [
      {
        id: 'guilt',
        title: 'Make them feel guilty for cancelling.',
        desc: 'Show how disappointed you are.',
        feedback: 'Expressing disappointment is fair, but guilt can damage trust. Explain how the late change affected you.',
      },
      {
        id: 'ask',
        title: 'Ask what happened and explain your feelings.',
        desc: 'Keep the conversation open.',
        feedback: 'You are giving your friend a chance to explain while still communicating your own feelings.',
      },
      {
        id: 'silent',
        title: 'Ignore their messages for several days.',
        desc: 'Let them guess why you are upset.',
        feedback: 'Taking space can help, but silence may create confusion. You can communicate that you need some time.',
      },
    ],
  },
  {
    id: 'feeling-rushed',
    category: 'Stress',
    situation: 'Several people are asking you for things at the same time.',
    question: 'What would help you handle the moment?',
    options: [
      {
        id: 'snap-rushed',
        title: 'Tell everyone to stop bothering you.',
        desc: 'Express your overload.',
        feedback: 'Your need for space is valid, but a sharp response may hurt others. Try asking for one request at a time.',
      },
      {
        id: 'organize',
        title: 'Pause and decide what needs attention first.',
        desc: 'Handle one thing at a time.',
        feedback: 'Prioritizing reduces the pressure to respond to everything simultaneously.',
      },
      {
        id: 'accept',
        title: 'Agree to every request immediately.',
        desc: 'Try to keep everyone happy.',
        feedback: 'Saying yes to everything can increase your stress. It is reasonable to communicate your limits.',
      },
    ],
  },
  {
    id: 'being-misunderstood',
    category: 'Communication',
    situation: 'Someone misunderstands your words and becomes upset with you.',
    question: 'What would you do?',
    options: [
      {
        id: 'insist',
        title: 'Insist that they should have understood you.',
        desc: 'Defend what you meant.',
        feedback: 'Your intention matters, but so does the impact. Clarifying your meaning can help both sides move forward.',
      },
      {
        id: 'clarify-intent',
        title: 'Clarify what you meant and listen to their concern.',
        desc: 'Understand both perspectives.',
        feedback: 'You are making room for clarification and acknowledging that communication can be interpreted differently.',
      },
      {
        id: 'blame-misunderstanding',
        title: 'Blame them for being too sensitive.',
        desc: 'Dismiss their reaction.',
        feedback: 'Dismissing their feelings can make the misunderstanding worse. Try to understand what they heard.',
      },
    ],
  },
  {
    id: 'unwanted-advice',
    category: 'Boundaries',
    situation: 'Someone keeps giving you advice even after you have said you do not need it.',
    question: 'How would you handle it?',
    options: [
      {
        id: 'snap-advice',
        title: 'Tell them to mind their own business.',
        desc: 'Stop the advice immediately.',
        feedback: 'A sharp response may damage the interaction. You can be direct about your preference without being insulting.',
      },
      {
        id: 'firm-thanks',
        title: 'Thank them and firmly say you will handle it yourself.',
        desc: 'Set a respectful boundary.',
        feedback: 'You acknowledge their intention while making your decision clear.',
      },
      {
        id: 'pretend-agree',
        title: 'Pretend to agree to avoid discomfort.',
        desc: 'End the conversation peacefully.',
        feedback: 'This may avoid tension now, but it may encourage more unwanted advice. A clear boundary can help.',
      },
    ],
  },
  {
    id: 'losing-game',
    category: 'Frustration',
    situation: 'You lose a game or competition after putting in a lot of effort.',
    question: 'What would you do?',
    options: [
      {
        id: 'blame-rules',
        title: 'Blame the rules or other players.',
        desc: 'Find a reason the result was unfair.',
        feedback: 'Sometimes a result may be unfair, but blaming immediately can prevent you from learning anything useful.',
      },
      {
        id: 'reflect-loss',
        title: 'Accept the result and reflect on what you learned.',
        desc: 'Separate effort from outcome.',
        feedback: 'You can feel disappointed and still recognize what the experience taught you.',
      },
      {
        id: 'quit',
        title: 'Decide you will never participate again.',
        desc: 'Avoid feeling disappointed next time.',
        feedback: 'Taking a break may be helpful, but one disappointing result does not have to define future experiences.',
      },
    ],
  },
  {
    id: 'unfair-rule',
    category: 'Fairness',
    situation: 'A rule is applied differently to you than to someone else.',
    question: 'How might you respond?',
    options: [
      {
        id: 'accuse-bias',
        title: 'Accuse everyone involved of being unfair.',
        desc: 'Challenge the decision angrily.',
        feedback: 'The difference may deserve an explanation. Asking for the reason first can make your concern easier to address.',
      },
      {
        id: 'ask-reason',
        title: 'Ask for clarification and explain what you noticed.',
        desc: 'Focus on the specific difference.',
        feedback: 'A specific question helps bring attention to the issue without assuming motives.',
      },
      {
        id: 'accept-rule',
        title: 'Accept it without asking anything.',
        desc: 'Avoid making a scene.',
        feedback: 'Avoiding conflict is understandable, but you can raise a concern respectfully when something seems inconsistent.',
      },
    ],
  },
  {
    id: 'constant-distraction',
    category: 'Focus',
    situation: 'Someone keeps distracting you while you are trying to finish an important task.',
    question: 'What would you do?',
    options: [
      {
        id: 'snap-focus',
        title: 'Tell them they are wasting your time.',
        desc: 'Make your frustration clear.',
        feedback: 'Your focus matters, but personal criticism may create tension. Explain when you are available instead.',
      },
      {
        id: 'set-time',
        title: 'Ask for uninterrupted time and agree to reconnect later.',
        desc: 'Set a practical boundary.',
        feedback: 'A clear time boundary helps protect your focus while keeping communication open.',
      },
      {
        id: 'ignore-focus',
        title: 'Keep working while becoming increasingly irritated.',
        desc: 'Avoid saying anything.',
        feedback: 'Silently tolerating repeated interruptions may increase frustration. A simple request could help.',
      },
    ],
  },
  {
    id: 'unexpected-feedback',
    category: 'Growth',
    situation: 'You receive unexpected feedback that you need to improve something you thought you were doing well.',
    question: 'How would you respond?',
    options: [
      {
        id: 'reject-feedback',
        title: 'Reject the feedback immediately.',
        desc: 'Protect your confidence.',
        feedback: 'Unexpected feedback can sting. Taking time to consider it may help you identify whether there is something useful in it.',
      },
      {
        id: 'explore-feedback',
        title: 'Ask for an example and consider the suggestion.',
        desc: 'Understand what could improve.',
        feedback: 'Asking for an example makes feedback more actionable and gives you a chance to assess it fairly.',
      },
      {
        id: 'self-criticize',
        title: 'Assume you are not capable.',
        desc: 'Take the feedback personally.',
        feedback: 'One area for improvement does not define your ability. Focus on the specific behaviour rather than your worth.',
      },
    ],
  },
  {
    id: 'personal-space',
    category: 'Boundaries',
    situation: 'Someone keeps entering your personal space even after you move away.',
    question: 'What would you do?',
    options: [
      {
        id: 'push-away',
        title: 'Push them away angrily.',
        desc: 'Make your discomfort obvious.',
        feedback: 'Your personal space matters. If you feel unsafe, prioritize distance and seek help. When safe, communicate the boundary clearly.',
      },
      {
        id: 'state-space',
        title: 'Clearly ask them to give you space.',
        desc: 'State what you need.',
        feedback: 'A direct boundary can make your needs clear. If they continue or you feel unsafe, move away and seek support.',
      },
      {
        id: 'stay-silent',
        title: 'Stay where you are and say nothing.',
        desc: 'Avoid making the situation awkward.',
        feedback: 'You do not need to ignore discomfort to keep things pleasant. Your safety and boundaries matter.',
      },
    ],
  },
  {
    id: 'heated-discussion',
    category: 'De-escalation',
    situation: 'A conversation becomes heated and both people start speaking louder.',
    question: 'What would you do?',
    options: [
      {
        id: 'speak-louder',
        title: 'Speak even louder so your point is heard.',
        desc: 'Avoid being talked over.',
        feedback: "Matching the other person's volume can intensify the disagreement. A pause may help both people reset.",
      },
      {
        id: 'suggest-break',
        title: 'Suggest a short break and return to the discussion.',
        desc: 'Give emotions time to settle.',
        feedback: 'A mutually agreed pause can make it easier to continue the conversation more constructively.',
      },
      {
        id: 'storm-out',
        title: 'Walk away without saying anything.',
        desc: 'End the argument.',
        feedback: 'Leaving may be necessary if the situation feels unsafe. Otherwise, explaining that you need a break can reduce confusion.',
      },
    ],
  },
  {
    id: 'disrespectful-tone',
    category: 'Respect',
    situation: 'Someone speaks to you in a dismissive or disrespectful tone.',
    question: 'How might you respond?',
    options: [
      {
        id: 'mirror-tone',
        title: 'Use the same disrespectful tone.',
        desc: 'Show that you will not tolerate it.',
        feedback: 'Mirroring disrespect can escalate the exchange. You can firmly address the tone without copying it.',
      },
      {
        id: 'name-tone',
        title: 'Calmly say you would like to continue respectfully.',
        desc: 'Address the behaviour directly.',
        feedback: 'You are setting an expectation for respectful communication without attacking the person.',
      },
      {
        id: 'accept-tone',
        title: 'Accept the tone and avoid speaking up.',
        desc: 'Keep the peace.',
        feedback: 'You may choose not to engage in the moment, but you are allowed to communicate when something feels disrespectful.',
      },
    ],
  },
];