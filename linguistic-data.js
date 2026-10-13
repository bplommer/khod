'use strict';

globalThis.MotionData = (() => {
// Each movement label and unprefixed paradigm is stored once.
    // A bound paradigm is only stored when directional prefixation changes it.
    // These are full stressed stems/forms, not surface prefixed verbs.
    const motionFamilies = [
  {
    "id": "walk",
    "movement": "Go on foot / walk",
    "base": {
      "uni": [
        {
          "infinitive": "идти́",
          "nonpast1sg": "иду́",
          "nonpast1pl": "идём",
          "pastM": "шёл",
          "pastF": "шла",
          "pastPl": "шли",
          "nonpast2sg": "идёшь",
          "nonpast3sg": "идёт",
          "nonpast2pl": "идёте",
          "nonpast3pl": "иду́т",
          "pastN": "шло"
        }
      ],
      "multi": [
        {
          "infinitive": "ходи́ть",
          "nonpast1sg": "хожу́",
          "nonpast1pl": "хо́дим",
          "pastM": "ходи́л",
          "pastF": "ходи́ла",
          "pastPl": "ходи́ли",
          "nonpast2sg": "хо́дишь",
          "nonpast3sg": "хо́дит",
          "nonpast2pl": "хо́дите",
          "nonpast3pl": "хо́дят",
          "pastN": "ходи́ло"
        }
      ]
    },
    "prefixedUnidirectional": {
      "forms": {
        "infinitive": "йти́",
        "nonpast1sg": "йду́",
        "nonpast1pl": "йдём",
        "pastM": "шёл",
        "pastF": "шла́",
        "pastPl": "шли́",
        "nonpast2sg": "йдёшь",
        "nonpast3sg": "йдёт",
        "nonpast2pl": "йдёте",
        "nonpast3pl": "йду́т",
        "pastN": "шло́"
      },
      "explanation": "идти́ uses the bound -йти́ / -йду́ / -шёл paradigm after these prefixes. при- additionally drops й in the nonpast.",
      "overrides": {
        "pri": {
          "nonpast1sg": "ду́",
          "nonpast1pl": "дём",
          "nonpast2sg": "дёшь",
          "nonpast3sg": "дёт",
          "nonpast2pl": "дёте",
          "nonpast3pl": "ду́т"
        }
      }
    },
    "distributedParticipants": "movers",
    "distributiveBlocked": {
      "uni": "No conventional standard distributive form on the -йти́ stem for при- / у-. Use the -ходи́ть form in the right column."
    },
    "distributiveUsage": {
      "uni": "productive",
      "multi": "established"
    }
  },
  {
    "id": "vehicle",
    "movement": "Go by vehicle",
    "base": {
      "uni": [
        {
          "infinitive": "е́хать",
          "nonpast1sg": "е́ду",
          "nonpast1pl": "е́дем",
          "pastM": "е́хал",
          "pastF": "е́хала",
          "pastPl": "е́хали",
          "nonpast2sg": "е́дешь",
          "nonpast3sg": "е́дет",
          "nonpast2pl": "е́дете",
          "nonpast3pl": "е́дут",
          "pastN": "е́хало"
        }
      ],
      "multi": [
        {
          "infinitive": "е́здить",
          "nonpast1sg": "е́зжу",
          "nonpast1pl": "е́здим",
          "pastM": "е́здил",
          "pastF": "е́здила",
          "pastPl": "е́здили",
          "nonpast2sg": "е́здишь",
          "nonpast3sg": "е́здит",
          "nonpast2pl": "е́здите",
          "nonpast3pl": "е́здят",
          "pastN": "е́здило"
        }
      ]
    },
    "directionalImperfective": {
      "forms": {
        "infinitive": "езжа́ть",
        "nonpast1sg": "езжа́ю",
        "nonpast1pl": "езжа́ем",
        "pastM": "езжа́л",
        "pastF": "езжа́ла",
        "pastPl": "езжа́ли",
        "nonpast2sg": "езжа́ешь",
        "nonpast3sg": "езжа́ет",
        "nonpast2pl": "езжа́ете",
        "nonpast3pl": "езжа́ют",
        "pastN": "езжа́ло"
      },
      "explanation": "The directional imperfective uses -езжа́ть, not -е́здить."
    },
    "distributedParticipants": "movers",
    "distributiveUsage": {
      "uni": "established",
      "multi": "established"
    }
  },
  {
    "id": "run",
    "movement": "Run",
    "base": {
      "uni": [
        {
          "infinitive": "бежа́ть",
          "nonpast1sg": "бегу́",
          "nonpast1pl": "бежи́м",
          "pastM": "бежа́л",
          "pastF": "бежа́ла",
          "pastPl": "бежа́ли",
          "nonpast2sg": "бежи́шь",
          "nonpast3sg": "бежи́т",
          "nonpast2pl": "бежи́те",
          "nonpast3pl": "бегу́т",
          "pastN": "бежа́ло"
        }
      ],
      "multi": [
        {
          "infinitive": "бе́гать",
          "nonpast1sg": "бе́гаю",
          "nonpast1pl": "бе́гаем",
          "pastM": "бе́гал",
          "pastF": "бе́гала",
          "pastPl": "бе́гали",
          "nonpast2sg": "бе́гаешь",
          "nonpast3sg": "бе́гает",
          "nonpast2pl": "бе́гаете",
          "nonpast3pl": "бе́гают",
          "pastN": "бе́гало"
        }
      ]
    },
    "directionalImperfective": {
      "forms": {
        "infinitive": "бега́ть",
        "nonpast1sg": "бега́ю",
        "nonpast1pl": "бега́ем",
        "pastM": "бега́л",
        "pastF": "бега́ла",
        "pastPl": "бега́ли",
        "nonpast2sg": "бега́ешь",
        "nonpast3sg": "бега́ет",
        "nonpast2pl": "бега́ете",
        "nonpast3pl": "бега́ют",
        "pastN": "бега́ло"
      },
      "explanation": "The directional imperfective shifts stress to -бега́ть."
    },
    "distributedParticipants": "movers",
    "distributiveUsage": {
      "uni": "established",
      "multi": "established"
    }
  },
  {
    "id": "fly",
    "movement": "Fly",
    "base": {
      "uni": [
        {
          "infinitive": "лете́ть",
          "nonpast1sg": "лечу́",
          "nonpast1pl": "лети́м",
          "pastM": "лете́л",
          "pastF": "лете́ла",
          "pastPl": "лете́ли",
          "nonpast2sg": "лети́шь",
          "nonpast3sg": "лети́т",
          "nonpast2pl": "лети́те",
          "nonpast3pl": "летя́т",
          "pastN": "лете́ло"
        }
      ],
      "multi": [
        {
          "infinitive": "лета́ть",
          "nonpast1sg": "лета́ю",
          "nonpast1pl": "лета́ем",
          "pastM": "лета́л",
          "pastF": "лета́ла",
          "pastPl": "лета́ли",
          "nonpast2sg": "лета́ешь",
          "nonpast3sg": "лета́ет",
          "nonpast2pl": "лета́ете",
          "nonpast3pl": "лета́ют",
          "pastN": "лета́ло"
        }
      ]
    },
    "distributedParticipants": "movers",
    "distributiveUsage": {
      "uni": "established",
      "multi": "established"
    }
  },
  {
    "id": "swim",
    "movement": "Swim / sail",
    "base": {
      "uni": [
        {
          "infinitive": "плыть",
          "nonpast1sg": "плыву́",
          "nonpast1pl": "плывём",
          "pastM": "плыл",
          "pastF": "плыла́",
          "pastPl": "плы́ли",
          "nonpast2sg": "плывёшь",
          "nonpast3sg": "плывёт",
          "nonpast2pl": "плывёте",
          "nonpast3pl": "плыву́т",
          "pastN": "плы́ло"
        }
      ],
      "multi": [
        {
          "infinitive": "пла́вать",
          "nonpast1sg": "пла́ваю",
          "nonpast1pl": "пла́ваем",
          "pastM": "пла́вал",
          "pastF": "пла́вала",
          "pastPl": "пла́вали",
          "nonpast2sg": "пла́ваешь",
          "nonpast3sg": "пла́вает",
          "nonpast2pl": "пла́ваете",
          "nonpast3pl": "пла́вают",
          "pastN": "пла́вало"
        }
      ]
    },
    "directionalImperfective": {
      "forms": {
        "infinitive": "плыва́ть",
        "nonpast1sg": "плыва́ю",
        "nonpast1pl": "плыва́ем",
        "pastM": "плыва́л",
        "pastF": "плыва́ла",
        "pastPl": "плыва́ли",
        "nonpast2sg": "плыва́ешь",
        "nonpast3sg": "плыва́ет",
        "nonpast2pl": "плыва́ете",
        "nonpast3pl": "плыва́ют",
        "pastN": "плыва́ло"
      },
      "explanation": "The directional imperfective uses -плыва́ть, not -пла́вать."
    },
    "distributedParticipants": "movers",
    "distributiveUsage": {
      "uni": "productive",
      "multi": "established"
    }
  },
  {
    "id": "crawl",
    "movement": "Crawl / creep",
    "base": {
      "uni": [
        {
          "infinitive": "ползти́",
          "nonpast1sg": "ползу́",
          "nonpast1pl": "ползём",
          "pastM": "полз",
          "pastF": "ползла́",
          "pastPl": "ползли́",
          "nonpast2sg": "ползёшь",
          "nonpast3sg": "ползёт",
          "nonpast2pl": "ползёте",
          "nonpast3pl": "ползу́т",
          "pastN": "ползло́"
        }
      ],
      "multi": [
        {
          "infinitive": "по́лзать",
          "nonpast1sg": "по́лзаю",
          "nonpast1pl": "по́лзаем",
          "pastM": "по́лзал",
          "pastF": "по́лзала",
          "pastPl": "по́лзали",
          "nonpast2sg": "по́лзаешь",
          "nonpast3sg": "по́лзает",
          "nonpast2pl": "по́лзаете",
          "nonpast3pl": "по́лзают",
          "pastN": "по́лзало"
        }
      ]
    },
    "directionalImperfective": {
      "forms": {
        "infinitive": "полза́ть",
        "nonpast1sg": "полза́ю",
        "nonpast1pl": "полза́ем",
        "pastM": "полза́л",
        "pastF": "полза́ла",
        "pastPl": "полза́ли",
        "nonpast2sg": "полза́ешь",
        "nonpast3sg": "полза́ет",
        "nonpast2pl": "полза́ете",
        "nonpast3pl": "полза́ют",
        "pastN": "полза́ло"
      },
      "explanation": "The directional imperfective shifts stress to -полза́ть."
    },
    "distributedParticipants": "movers",
    "distributiveUsage": {
      "uni": "productive",
      "multi": "productive"
    }
  },
  {
    "id": "climb",
    "movement": "Climb / clamber",
    "base": {
      "uni": [
        {
          "infinitive": "лезть",
          "nonpast1sg": "ле́зу",
          "nonpast1pl": "ле́зем",
          "pastM": "лез",
          "pastF": "ле́зла",
          "pastPl": "ле́зли",
          "nonpast2sg": "ле́зешь",
          "nonpast3sg": "ле́зет",
          "nonpast2pl": "ле́зете",
          "nonpast3pl": "ле́зут",
          "pastN": "ле́зло"
        }
      ],
      "multi": [
        {
          "infinitive": "ла́зить",
          "nonpast1sg": "ла́жу",
          "nonpast1pl": "ла́зим",
          "pastM": "ла́зил",
          "pastF": "ла́зила",
          "pastPl": "ла́зили",
          "nonpast2sg": "ла́зишь",
          "nonpast3sg": "ла́зит",
          "nonpast2pl": "ла́зите",
          "nonpast3pl": "ла́зят",
          "pastN": "ла́зило"
        },
        {
          "infinitive": "ла́зать",
          "nonpast1sg": "ла́заю",
          "nonpast1pl": "ла́заем",
          "pastM": "ла́зал",
          "pastF": "ла́зала",
          "pastPl": "ла́зали",
          "nonpast2sg": "ла́заешь",
          "nonpast3sg": "ла́зает",
          "nonpast2pl": "ла́заете",
          "nonpast3pl": "ла́зают",
          "pastN": "ла́зало"
        }
      ]
    },
    "directionalImperfective": {
      "forms": {
        "infinitive": "леза́ть",
        "nonpast1sg": "леза́ю",
        "nonpast1pl": "леза́ем",
        "pastM": "леза́л",
        "pastF": "леза́ла",
        "pastPl": "леза́ли",
        "nonpast2sg": "леза́ешь",
        "nonpast3sg": "леза́ет",
        "nonpast2pl": "леза́ете",
        "nonpast3pl": "леза́ют",
        "pastN": "леза́ло"
      },
      "explanation": "The directional imperfective uses -леза́ть; the two unprefixed variants converge here."
    },
    "distributedParticipants": "movers",
    "distributiveUsage": {
      "uni": "productive",
      "multi": "productive"
    }
  },
  {
    "id": "trudge",
    "movement": "Trudge / wander",
    "base": {
      "uni": [
        {
          "infinitive": "брести́",
          "nonpast1sg": "бреду́",
          "nonpast1pl": "бредём",
          "pastM": "брёл",
          "pastF": "брела́",
          "pastPl": "брели́",
          "nonpast2sg": "бредёшь",
          "nonpast3sg": "бредёт",
          "nonpast2pl": "бредёте",
          "nonpast3pl": "бреду́т",
          "pastN": "брело́"
        }
      ],
      "multi": [
        {
          "infinitive": "броди́ть",
          "nonpast1sg": "брожу́",
          "nonpast1pl": "бро́дим",
          "pastM": "броди́л",
          "pastF": "броди́ла",
          "pastPl": "броди́ли",
          "nonpast2sg": "бро́дишь",
          "nonpast3sg": "бро́дит",
          "nonpast2pl": "бро́дите",
          "nonpast3pl": "бро́дят",
          "pastN": "броди́ло"
        }
      ]
    },
    "directionalImperfective": {
      "forms": {
        "infinitive": "бреда́ть",
        "nonpast1sg": "бреда́ю",
        "nonpast1pl": "бреда́ем",
        "pastM": "бреда́л",
        "pastF": "бреда́ла",
        "pastPl": "бреда́ли",
        "nonpast2sg": "бреда́ешь",
        "nonpast3sg": "бреда́ет",
        "nonpast2pl": "бреда́ете",
        "nonpast3pl": "бреда́ют",
        "pastN": "бреда́ло"
      },
      "explanation": "The directional imperfective uses -бреда́ть, not -броди́ть."
    },
    "distributedParticipants": "movers",
    "distributiveUsage": {
      "uni": "productive",
      "multi": "productive"
    }
  },
  {
    "id": "carry",
    "movement": "Carry in the hands / on the body",
    "base": {
      "uni": [
        {
          "infinitive": "нести́",
          "nonpast1sg": "несу́",
          "nonpast1pl": "несём",
          "pastM": "нёс",
          "pastF": "несла́",
          "pastPl": "несли́",
          "nonpast2sg": "несёшь",
          "nonpast3sg": "несёт",
          "nonpast2pl": "несёте",
          "nonpast3pl": "несу́т",
          "pastN": "несло́"
        }
      ],
      "multi": [
        {
          "infinitive": "носи́ть",
          "nonpast1sg": "ношу́",
          "nonpast1pl": "но́сим",
          "pastM": "носи́л",
          "pastF": "носи́ла",
          "pastPl": "носи́ли",
          "nonpast2sg": "но́сишь",
          "nonpast3sg": "но́сит",
          "nonpast2pl": "но́сите",
          "nonpast3pl": "но́сят",
          "pastN": "носи́ло"
        }
      ]
    },
    "distributedParticipants": "objects",
    "distributiveUsage": {
      "uni": "productive",
      "multi": "productive"
    }
  },
  {
    "id": "transport",
    "movement": "Transport by vehicle",
    "base": {
      "uni": [
        {
          "infinitive": "везти́",
          "nonpast1sg": "везу́",
          "nonpast1pl": "везём",
          "pastM": "вёз",
          "pastF": "везла́",
          "pastPl": "везли́",
          "nonpast2sg": "везёшь",
          "nonpast3sg": "везёт",
          "nonpast2pl": "везёте",
          "nonpast3pl": "везу́т",
          "pastN": "везло́"
        }
      ],
      "multi": [
        {
          "infinitive": "вози́ть",
          "nonpast1sg": "вожу́",
          "nonpast1pl": "во́зим",
          "pastM": "вози́л",
          "pastF": "вози́ла",
          "pastPl": "вози́ли",
          "nonpast2sg": "во́зишь",
          "nonpast3sg": "во́зит",
          "nonpast2pl": "во́зите",
          "nonpast3pl": "во́зят",
          "pastN": "вози́ло"
        }
      ]
    },
    "distributedParticipants": "objects",
    "distributiveUsage": {
      "uni": "productive",
      "multi": "productive"
    }
  },
  {
    "id": "lead",
    "movement": "Lead / accompany",
    "base": {
      "uni": [
        {
          "infinitive": "вести́",
          "nonpast1sg": "веду́",
          "nonpast1pl": "ведём",
          "pastM": "вёл",
          "pastF": "вела́",
          "pastPl": "вели́",
          "nonpast2sg": "ведёшь",
          "nonpast3sg": "ведёт",
          "nonpast2pl": "ведёте",
          "nonpast3pl": "веду́т",
          "pastN": "вело́"
        }
      ],
      "multi": [
        {
          "infinitive": "води́ть",
          "nonpast1sg": "вожу́",
          "nonpast1pl": "во́дим",
          "pastM": "води́л",
          "pastF": "води́ла",
          "pastPl": "води́ли",
          "nonpast2sg": "во́дишь",
          "nonpast3sg": "во́дит",
          "nonpast2pl": "во́дите",
          "nonpast3pl": "во́дят",
          "pastN": "води́ло"
        }
      ]
    },
    "distributedParticipants": "objects",
    "distributiveUsage": {
      "uni": "productive",
      "multi": "productive"
    }
  },
  {
    "id": "drag",
    "movement": "Drag / haul",
    "base": {
      "uni": [
        {
          "infinitive": "тащи́ть",
          "nonpast1sg": "тащу́",
          "nonpast1pl": "та́щим",
          "pastM": "тащи́л",
          "pastF": "тащи́ла",
          "pastPl": "тащи́ли",
          "nonpast2sg": "та́щишь",
          "nonpast3sg": "та́щит",
          "nonpast2pl": "та́щите",
          "nonpast3pl": "та́щат",
          "pastN": "тащи́ло"
        }
      ],
      "multi": [
        {
          "infinitive": "таска́ть",
          "nonpast1sg": "таска́ю",
          "nonpast1pl": "таска́ем",
          "pastM": "таска́л",
          "pastF": "таска́ла",
          "pastPl": "таска́ли",
          "nonpast2sg": "таска́ешь",
          "nonpast3sg": "таска́ет",
          "nonpast2pl": "таска́ете",
          "nonpast3pl": "таска́ют",
          "pastN": "таска́ло"
        }
      ]
    },
    "directionalImperfective": {
      "forms": {
        "infinitive": "та́скивать",
        "nonpast1sg": "та́скиваю",
        "nonpast1pl": "та́скиваем",
        "pastM": "та́скивал",
        "pastF": "та́скивала",
        "pastPl": "та́скивали",
        "nonpast2sg": "та́скиваешь",
        "nonpast3sg": "та́скивает",
        "nonpast2pl": "та́скиваете",
        "nonpast3pl": "та́скивают",
        "pastN": "та́скивало"
      },
      "explanation": "The directional imperfective uses -та́скивать, not -таска́ть."
    },
    "distributedParticipants": "objects",
    "distributiveUsage": {
      "uni": "productive",
      "multi": "productive"
    }
  },
  {
    "id": "roll",
    "movement": "Roll / wheel something",
    "base": {
      "uni": [
        {
          "infinitive": "кати́ть",
          "nonpast1sg": "качу́",
          "nonpast1pl": "ка́тим",
          "pastM": "кати́л",
          "pastF": "кати́ла",
          "pastPl": "кати́ли",
          "nonpast2sg": "ка́тишь",
          "nonpast3sg": "ка́тит",
          "nonpast2pl": "ка́тите",
          "nonpast3pl": "ка́тят",
          "pastN": "кати́ло"
        }
      ],
      "multi": [
        {
          "infinitive": "ката́ть",
          "nonpast1sg": "ката́ю",
          "nonpast1pl": "ката́ем",
          "pastM": "ката́л",
          "pastF": "ката́ла",
          "pastPl": "ката́ли",
          "nonpast2sg": "ката́ешь",
          "nonpast3sg": "ката́ет",
          "nonpast2pl": "ката́ете",
          "nonpast3pl": "ката́ют",
          "pastN": "ката́ло"
        }
      ]
    },
    "directionalImperfective": {
      "forms": {
        "infinitive": "ка́тывать",
        "nonpast1sg": "ка́тываю",
        "nonpast1pl": "ка́тываем",
        "pastM": "ка́тывал",
        "pastF": "ка́тывала",
        "pastPl": "ка́тывали",
        "nonpast2sg": "ка́тываешь",
        "nonpast3sg": "ка́тывает",
        "nonpast2pl": "ка́тываете",
        "nonpast3pl": "ка́тывают",
        "pastN": "ка́тывало"
      },
      "explanation": "The directional imperfective uses -ка́тывать, not -ката́ть."
    },
    "distributedParticipants": "objects",
    "distributiveUsage": {
      "uni": "productive",
      "multi": "productive"
    }
  },
  {
    "id": "herd",
    "movement": "Drive / chase / herd",
    "base": {
      "uni": [
        {
          "infinitive": "гнать",
          "nonpast1sg": "гоню́",
          "nonpast1pl": "го́ним",
          "pastM": "гнал",
          "pastF": "гнала́",
          "pastPl": "гна́ли",
          "nonpast2sg": "го́нишь",
          "nonpast3sg": "го́нит",
          "nonpast2pl": "го́ните",
          "nonpast3pl": "го́нят",
          "pastN": "гнало́"
        }
      ],
      "multi": [
        {
          "infinitive": "гоня́ть",
          "nonpast1sg": "гоня́ю",
          "nonpast1pl": "гоня́ем",
          "pastM": "гоня́л",
          "pastF": "гоня́ла",
          "pastPl": "гоня́ли",
          "nonpast2sg": "гоня́ешь",
          "nonpast3sg": "гоня́ет",
          "nonpast2pl": "гоня́ете",
          "nonpast3pl": "гоня́ют",
          "pastN": "гоня́ло"
        }
      ]
    },
    "distributedParticipants": "objects",
    "distributiveUsage": {
      "uni": "productive",
      "multi": "productive"
    }
  }
];
    // Register and sense notes belong to a movement/prefix combination, not each form.
    const usageNotes = {
      climb: {
        pri: { both: 'Colloquial: arrive by crawling or clambering; also used dismissively of an unwanted arrival.' },
        u: { both: 'Colloquial: get away by crawling or squeezing through a gap.' },
        po: { uni: 'Start climbing or clambering.', multi: 'Climb or clamber for a while.' }
      },
      carry: {
        po: { multi: 'Carry or wear something for a while. This is not the separate verb поноси́ть meaning “revile”.' }
      },
      herd: {
        u: { both: 'Drive or herd away; with a vehicle, often “steal / hijack”.' }
      }
    };
    const prefixSettings = {
      none: {
        label: 'No prefix',
        surface: '',
        kind: 'unprefixed',
        aspects: { uni: 'imperfective', multi: 'imperfective' },
        info: 'Both columns are imperfective. The contrast is directionality, not aspect.',
        titles: ['Unidirectional', 'Multidirectional'],
        hints: ['A particular journey in one direction', 'Habitual, general, or varied movement']
      },
      pri: {
        label: 'при-',
        surface: 'при',
        kind: 'directional',
        aspects: { uni: 'perfective', multi: 'imperfective' },
        info: 'при-: arrival / bringing to a destination. The columns are now perfective and imperfective, not two directions of movement.',
        titles: ['Perfective', 'Imperfective'],
        hints: ['Corresponding unidirectional family', 'Corresponding multidirectional family']
      },
      u: {
        label: 'у-',
        surface: 'у',
        kind: 'directional',
        aspects: { uni: 'perfective', multi: 'imperfective' },
        info: 'у-: departure / taking away. The columns are now perfective and imperfective, not two directions of movement.',
        titles: ['Perfective', 'Imperfective'],
        hints: ['Corresponding unidirectional family', 'Corresponding multidirectional family']
      },
      po: {
        label: 'по-',
        surface: 'по',
        kind: 'phase',
        aspects: { uni: 'perfective', multi: 'perfective' },
        info: 'по- gives two different meanings: start / set off (left), or do the activity for a while (right). Both are perfective, not an aspect pair.',
        titles: ['Start / set off', 'For a while'],
        hints: ['Perfective · unidirectional base', 'Perfective · multidirectional base']
      }
    };

  return Object.freeze({ motionFamilies, usageNotes, prefixSettings });
})();
