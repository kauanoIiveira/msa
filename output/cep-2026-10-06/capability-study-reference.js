export const capabilityStudy = {
  "source": {
    "name": "T20A03(EN)5 - Capability study senai.xlsx",
    "sheet": "Selo ",
    "sha256": "6a030b82f7dc32c6bd05a43a426344c72683fad61495aab70dbc13406ea11c8e",
    "observationRows": 17,
    "timestampPrecision": "date",
    "chronologyConfirmed": false,
    "sheets": [
      {
        "name": "Selo ",
        "rows": 1001,
        "columns": 87
      },
      {
        "name": "Normality test ",
        "rows": 1209,
        "columns": 37
      }
    ]
  },
  "parameters": [
    {
      "code": "MSA_F",
      "column": "F",
      "name": "Temp Ambiente",
      "unit": "°C",
      "limits": {
        "lower": 13,
        "upper": 30
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "F17",
          "raw": 16
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "F18",
          "raw": 16
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "F19",
          "raw": 16
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "F20",
          "raw": 24
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "F21",
          "raw": 17
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "F22",
          "raw": 24
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "F23",
          "raw": 21
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "F24",
          "raw": 32
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "F25",
          "raw": "22,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "F26",
          "raw": "22,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "F27",
          "raw": 15
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "F28",
          "raw": 20
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "F29",
          "raw": 18
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "F30",
          "raw": 15
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "F31",
          "raw": 14
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "F32",
          "raw": 28
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "F33",
          "raw": 25
        }
      ],
      "excelSummary": [
        {
          "cell": "F69",
          "formula": "=IF(F17=\"\",\"\",MIN(F17:F67))",
          "cached": 14
        },
        {
          "cell": "F70",
          "formula": "=IF(F17=\"\",\"\",MAX(F17:F67))",
          "cached": 32
        },
        {
          "cell": "F71",
          "formula": "=IF(F17=\"\",\"\",AVERAGE(F17:F67))",
          "cached": 20.066666666666666
        },
        {
          "cell": "F72",
          "formula": "=IF(F17=\"\",\"\",STDEVP(F17:F67))",
          "cached": 5.246797965320266
        },
        {
          "cell": "F73",
          "formula": "=IF(F17=\"\",\"\",(F11-F10)/6/F72)",
          "cached": 0.5400118990784097
        },
        {
          "cell": "F74",
          "formula": "=IF(F17=\"\",\"\",MIN(((F11-F71)/3/F72),((F71-F10)/3/F72)))",
          "cached": 0.44895106903773674
        }
      ]
    },
    {
      "code": "MSA_H",
      "column": "H",
      "name": "Aquecimento Z1",
      "unit": "°C",
      "limits": {
        "lower": 0,
        "upper": 0
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "H17",
          "raw": 45
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "H18",
          "raw": 33
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "H19",
          "raw": 47
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "H20",
          "raw": 34
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "H21",
          "raw": 46
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "H22",
          "raw": 47
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "H23",
          "raw": 35
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "H24",
          "raw": 52
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "H25",
          "raw": "43,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "H26",
          "raw": "41,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "H27",
          "raw": 45
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "H28",
          "raw": 48
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "H29",
          "raw": 51
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "H30",
          "raw": 51
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "H31",
          "raw": 45
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "H32",
          "raw": 48
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "H33",
          "raw": 49
        }
      ],
      "excelSummary": [
        {
          "cell": "H69",
          "formula": "=IF(H17=\"\",\"\",MIN(H17:H67))",
          "cached": 33
        },
        {
          "cell": "H70",
          "formula": "=IF(H17=\"\",\"\",MAX(H17:H67))",
          "cached": 52
        },
        {
          "cell": "H71",
          "formula": "=IF(H17=\"\",\"\",AVERAGE(H17:H67))",
          "cached": 45.06666666666667
        },
        {
          "cell": "H72",
          "formula": "=IF(H17=\"\",\"\",STDEVP(H17:H67))",
          "cached": 5.9382002511048935
        },
        {
          "cell": "H73",
          "formula": "=IF(H17=\"\",\"\",(H11-H10)/6/H72)",
          "cached": 0
        },
        {
          "cell": "H74",
          "formula": "=IF(H17=\"\",\"\",MIN(((H11-H71)/3/H72),((H71-H10)/3/H72)))",
          "cached": -2.529760127140729
        }
      ]
    },
    {
      "code": "MSA_J",
      "column": "J",
      "name": "Aquecimento Z2",
      "unit": "°C",
      "limits": {
        "lower": 255,
        "upper": 265
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "J17",
          "raw": 254
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "J18",
          "raw": 215
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "J19",
          "raw": 256
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "J20",
          "raw": 257
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "J21",
          "raw": 254
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "J22",
          "raw": 246
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "J23",
          "raw": 239
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "J24",
          "raw": 233
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "J25",
          "raw": "245,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "J26",
          "raw": "249,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "J27",
          "raw": 255
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "J28",
          "raw": 244
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "J29",
          "raw": 243
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "J30",
          "raw": 243
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "J31",
          "raw": 247
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "J32",
          "raw": 248
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "J33",
          "raw": 250
        }
      ],
      "excelSummary": [
        {
          "cell": "J69",
          "formula": "=IF(J17=\"\",\"\",MIN(J17:J67))",
          "cached": 215
        },
        {
          "cell": "J70",
          "formula": "=IF(J17=\"\",\"\",MAX(J17:J67))",
          "cached": 257
        },
        {
          "cell": "J71",
          "formula": "=IF(J17=\"\",\"\",AVERAGE(J17:J67))",
          "cached": 245.6
        },
        {
          "cell": "J72",
          "formula": "=IF(J17=\"\",\"\",STDEVP(J17:J67))",
          "cached": 10.486817121192367
        },
        {
          "cell": "J73",
          "formula": "=IF(J17=\"\",\"\",(J11-J10)/6/J72)",
          "cached": 0.1589296969142878
        },
        {
          "cell": "J74",
          "formula": "=IF(J17=\"\",\"\",MIN(((J11-J71)/3/J72),((J71-J10)/3/J72)))",
          "cached": -0.2987878301988612
        }
      ]
    },
    {
      "code": "MSA_L",
      "column": "L",
      "name": "Aquecimento Z3",
      "unit": "°C",
      "limits": {
        "lower": 255,
        "upper": 265
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "L17",
          "raw": 256
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "L18",
          "raw": 236
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "L19",
          "raw": 249
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "L20",
          "raw": 249
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "L21",
          "raw": 250
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "L22",
          "raw": 246
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "L23",
          "raw": 241
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "L24",
          "raw": 235
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "L25",
          "raw": "251,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "L26",
          "raw": "249,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "L27",
          "raw": 255
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "L28",
          "raw": 245
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "L29",
          "raw": 246
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "L30",
          "raw": 246
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "L31",
          "raw": 252
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "L32",
          "raw": 251
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "L33",
          "raw": 252
        }
      ],
      "excelSummary": [
        {
          "cell": "L69",
          "formula": "=IF(L17=\"\",\"\",MIN(L17:L67))",
          "cached": 235
        },
        {
          "cell": "L70",
          "formula": "=IF(L17=\"\",\"\",MAX(L17:L67))",
          "cached": 256
        },
        {
          "cell": "L71",
          "formula": "=IF(L17=\"\",\"\",AVERAGE(L17:L67))",
          "cached": 247.26666666666668
        },
        {
          "cell": "L72",
          "formula": "=IF(L17=\"\",\"\",STDEVP(L17:L67))",
          "cached": 5.971785513748984
        },
        {
          "cell": "L73",
          "formula": "=IF(L17=\"\",\"\",(L11-L10)/6/L72)",
          "cached": 0.2790901754306916
        },
        {
          "cell": "L74",
          "formula": "=IF(L17=\"\",\"\",MIN(((L11-L71)/3/L72),((L71-L10)/3/L72)))",
          "cached": -0.43165947133280225
        }
      ]
    },
    {
      "code": "MSA_N",
      "column": "N",
      "name": "Aquecimento Z4",
      "unit": "°C",
      "limits": {
        "lower": 252,
        "upper": 262
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "N17",
          "raw": 251
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "N18",
          "raw": 235
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "N19",
          "raw": 251
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "N20",
          "raw": 250
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "N21",
          "raw": 249
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "N22",
          "raw": 244
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "N23",
          "raw": 239
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "N24",
          "raw": 235
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "N25",
          "raw": "248,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "N26",
          "raw": "251,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "N27",
          "raw": 256
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "N28",
          "raw": 245
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "N29",
          "raw": 245
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "N30",
          "raw": 245
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "N31",
          "raw": 249
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "N32",
          "raw": 250
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "N33",
          "raw": 250
        }
      ],
      "excelSummary": [
        {
          "cell": "N69",
          "formula": "=IF(N17=\"\",\"\",MIN(N17:N67))",
          "cached": 235
        },
        {
          "cell": "N70",
          "formula": "=IF(N17=\"\",\"\",MAX(N17:N67))",
          "cached": 256
        },
        {
          "cell": "N71",
          "formula": "=IF(N17=\"\",\"\",AVERAGE(N17:N67))",
          "cached": 246.26666666666668
        },
        {
          "cell": "N72",
          "formula": "=IF(N17=\"\",\"\",STDEVP(N17:N67))",
          "cached": 5.847696602556904
        },
        {
          "cell": "N73",
          "formula": "=IF(N17=\"\",\"\",(N11-N10)/6/N72)",
          "cached": 0.28501250662319194
        },
        {
          "cell": "N74",
          "formula": "=IF(N17=\"\",\"\",MIN(((N11-N71)/3/N72),((N71-N10)/3/N72)))",
          "cached": -0.32681434092792605
        }
      ]
    },
    {
      "code": "MSA_P",
      "column": "P",
      "name": "Aquecimento Z5",
      "unit": "°C",
      "limits": {
        "lower": 252,
        "upper": 262
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "P17",
          "raw": 252
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "P18",
          "raw": 242
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "P19",
          "raw": 250
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "P20",
          "raw": 250
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "P21",
          "raw": 250
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "P22",
          "raw": 245
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "P23",
          "raw": 240
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "P24",
          "raw": 235
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "P25",
          "raw": "245,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "P26",
          "raw": "235,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "P27",
          "raw": 255
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "P28",
          "raw": 245
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "P29",
          "raw": 245
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "P30",
          "raw": 245
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "P31",
          "raw": 250
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "P32",
          "raw": 250
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "P33",
          "raw": 250
        }
      ],
      "excelSummary": [
        {
          "cell": "P69",
          "formula": "=IF(P17=\"\",\"\",MIN(P17:P67))",
          "cached": 235
        },
        {
          "cell": "P70",
          "formula": "=IF(P17=\"\",\"\",MAX(P17:P67))",
          "cached": 255
        },
        {
          "cell": "P71",
          "formula": "=IF(P17=\"\",\"\",AVERAGE(P17:P67))",
          "cached": 246.93333333333334
        },
        {
          "cell": "P72",
          "formula": "=IF(P17=\"\",\"\",STDEVP(P17:P67))",
          "cached": 5.0128723192286575
        },
        {
          "cell": "P73",
          "formula": "=IF(P17=\"\",\"\",(P11-P10)/6/P72)",
          "cached": 0.3324773823329936
        },
        {
          "cell": "P74",
          "formula": "=IF(P17=\"\",\"\",MIN(((P11-P71)/3/P72),((P71-P10)/3/P72)))",
          "cached": -0.3369104140974332
        }
      ]
    },
    {
      "code": "MSA_R",
      "column": "R",
      "name": "Aquecimento  Z6",
      "unit": "°C",
      "limits": {
        "lower": 252,
        "upper": 262
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "R17",
          "raw": 251
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "R18",
          "raw": 235
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "R19",
          "raw": 251
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "R20",
          "raw": 250
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "R21",
          "raw": 250
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "R22",
          "raw": 241
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "R23",
          "raw": 239
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "R24",
          "raw": 240
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "R25",
          "raw": "244,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "R26",
          "raw": "236,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "R27",
          "raw": 255
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "R28",
          "raw": 249
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "R29",
          "raw": 249
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "R30",
          "raw": 249
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "R31",
          "raw": 249
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "R32",
          "raw": 249
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "R33",
          "raw": 249
        }
      ],
      "excelSummary": [
        {
          "cell": "R69",
          "formula": "=IF(R17=\"\",\"\",MIN(R17:R67))",
          "cached": 235
        },
        {
          "cell": "R70",
          "formula": "=IF(R17=\"\",\"\",MAX(R17:R67))",
          "cached": 255
        },
        {
          "cell": "R71",
          "formula": "=IF(R17=\"\",\"\",AVERAGE(R17:R67))",
          "cached": 247.06666666666666
        },
        {
          "cell": "R72",
          "formula": "=IF(R17=\"\",\"\",STDEVP(R17:R67))",
          "cached": 5.359933664597809
        },
        {
          "cell": "R73",
          "formula": "=IF(R17=\"\",\"\",(R11-R10)/6/R72)",
          "cached": 0.3109491219406216
        },
        {
          "cell": "R74",
          "formula": "=IF(R17=\"\",\"\",MIN(((R11-R71)/3/R72),((R71-R10)/3/R72)))",
          "cached": -0.3068031336480802
        }
      ]
    },
    {
      "code": "MSA_T",
      "column": "T",
      "name": "Aquecimento   Z7",
      "unit": "°C",
      "limits": {
        "lower": 265,
        "upper": 275
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "T17",
          "raw": 265
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "T18",
          "raw": 247
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "T19",
          "raw": 259
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "T20",
          "raw": 255
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "T21",
          "raw": 250
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "T22",
          "raw": 242
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "T23",
          "raw": 240
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "T24",
          "raw": 240
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "T25",
          "raw": "240,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "T26",
          "raw": "234,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "T27",
          "raw": 255
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "T28",
          "raw": 250
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "T29",
          "raw": 250
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "T30",
          "raw": 250
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "T31",
          "raw": 250
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "T32",
          "raw": 250
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "T33",
          "raw": 250
        }
      ],
      "excelSummary": [
        {
          "cell": "T69",
          "formula": "=IF(T17=\"\",\"\",MIN(T17:T67))",
          "cached": 240
        },
        {
          "cell": "T70",
          "formula": "=IF(T17=\"\",\"\",MAX(T17:T67))",
          "cached": 265
        },
        {
          "cell": "T71",
          "formula": "=IF(T17=\"\",\"\",AVERAGE(T17:T67))",
          "cached": 250.2
        },
        {
          "cell": "T72",
          "formula": "=IF(T17=\"\",\"\",STDEVP(T17:T67))",
          "cached": 6.472505954677316
        },
        {
          "cell": "T73",
          "formula": "=IF(T17=\"\",\"\",(T11-T10)/6/T72)",
          "cached": 0.2574994412268189
        },
        {
          "cell": "T74",
          "formula": "=IF(T17=\"\",\"\",MIN(((T11-T71)/3/T72),((T71-T10)/3/T72)))",
          "cached": -0.7621983460313845
        }
      ]
    },
    {
      "code": "MSA_V",
      "column": "V",
      "name": "Aquecimento   Z8",
      "unit": "°C",
      "limits": {
        "lower": 265,
        "upper": 275
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "V17",
          "raw": 266
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "V18",
          "raw": 238
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "V19",
          "raw": 259
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "V20",
          "raw": 256
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "V21",
          "raw": 250
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "V22",
          "raw": 243
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "V23",
          "raw": 241
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "V24",
          "raw": 240
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "V25",
          "raw": "240,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "V26",
          "raw": "234,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "V27",
          "raw": 255
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "V28",
          "raw": 250
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "V29",
          "raw": 250
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "V30",
          "raw": 250
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "V31",
          "raw": 250
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "V32",
          "raw": 250
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "V33",
          "raw": 250
        }
      ],
      "excelSummary": [
        {
          "cell": "V69",
          "formula": "=IF(V17=\"\",\"\",MIN(V17:V67))",
          "cached": 238
        },
        {
          "cell": "V70",
          "formula": "=IF(V17=\"\",\"\",MAX(V17:V67))",
          "cached": 266
        },
        {
          "cell": "V71",
          "formula": "=IF(V17=\"\",\"\",AVERAGE(V17:V67))",
          "cached": 249.86666666666667
        },
        {
          "cell": "V72",
          "formula": "=IF(V17=\"\",\"\",STDEVP(V17:V67))",
          "cached": 7.1727880833668065
        },
        {
          "cell": "V73",
          "formula": "=IF(V17=\"\",\"\",(V11-V10)/6/V72)",
          "cached": 0.2323596692521211
        },
        {
          "cell": "V74",
          "formula": "=IF(V17=\"\",\"\",MIN(((V11-V71)/3/V72),((V71-V10)/3/V72)))",
          "cached": -0.7032752656030861
        }
      ]
    },
    {
      "code": "MSA_X",
      "column": "X",
      "name": "Aquecimento  Z9",
      "unit": "°C",
      "limits": {
        "lower": 0,
        "upper": 0
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "X17",
          "raw": 93
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "X18",
          "raw": 83
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "X19",
          "raw": 91
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "X20",
          "raw": 92
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "X21",
          "raw": 80
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "X22",
          "raw": 92
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "X23",
          "raw": 88
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "X24",
          "raw": 76
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "X25",
          "raw": "88,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "X26",
          "raw": "89,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "X27",
          "raw": 92
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "X28",
          "raw": 94
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "X29",
          "raw": 97
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "X30",
          "raw": 97
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "X31",
          "raw": 91
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "X32",
          "raw": 93
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "X33",
          "raw": 91
        }
      ],
      "excelSummary": [
        {
          "cell": "X69",
          "formula": "=IF(X17=\"\",\"\",MIN(X17:X67))",
          "cached": 76
        },
        {
          "cell": "X70",
          "formula": "=IF(X17=\"\",\"\",MAX(X17:X67))",
          "cached": 97
        },
        {
          "cell": "X71",
          "formula": "=IF(X17=\"\",\"\",AVERAGE(X17:X67))",
          "cached": 90
        },
        {
          "cell": "X72",
          "formula": "=IF(X17=\"\",\"\",STDEVP(X17:X67))",
          "cached": 5.750362307426087
        },
        {
          "cell": "X73",
          "formula": "=IF(X17=\"\",\"\",(X11-X10)/6/X72)",
          "cached": 0
        },
        {
          "cell": "X74",
          "formula": "=IF(X17=\"\",\"\",MIN(((X11-X71)/3/X72),((X71-X10)/3/X72)))",
          "cached": -5.217062577301893
        }
      ]
    },
    {
      "code": "MSA_Z",
      "column": "Z",
      "name": "Aquecimento Z10",
      "unit": "°C",
      "limits": {
        "lower": 0,
        "upper": 0
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "Z17",
          "raw": 87
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "Z18",
          "raw": 101
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "Z19",
          "raw": 87
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "Z20",
          "raw": 91
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "Z21",
          "raw": 116
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "Z22",
          "raw": 92
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "Z23",
          "raw": 87
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "Z24",
          "raw": 107
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "Z25",
          "raw": "93,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "Z26",
          "raw": "98,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "Z27",
          "raw": 96
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "Z28",
          "raw": 101
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "Z29",
          "raw": 99
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "Z30",
          "raw": 99
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "Z31",
          "raw": 99
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "Z32",
          "raw": 102
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "Z33",
          "raw": 101
        }
      ],
      "excelSummary": [
        {
          "cell": "Z69",
          "formula": "=IF(Z17=\"\",\"\",MIN(Z17:Z67))",
          "cached": 87
        },
        {
          "cell": "Z70",
          "formula": "=IF(Z17=\"\",\"\",MAX(Z17:Z67))",
          "cached": 116
        },
        {
          "cell": "Z71",
          "formula": "=IF(Z17=\"\",\"\",AVERAGE(Z17:Z67))",
          "cached": 97.66666666666667
        },
        {
          "cell": "Z72",
          "formula": "=IF(Z17=\"\",\"\",STDEVP(Z17:Z67))",
          "cached": 7.751702321999271
        },
        {
          "cell": "Z73",
          "formula": "=IF(Z17=\"\",\"\",(Z11-Z10)/6/Z72)",
          "cached": 0
        },
        {
          "cell": "Z74",
          "formula": "=IF(Z17=\"\",\"\",MIN(((Z11-Z71)/3/Z72),((Z71-Z10)/3/Z72)))",
          "cached": -4.199794342355375
        }
      ]
    },
    {
      "code": "MSA_AB",
      "column": "AB",
      "name": "Aquecimento  Z11",
      "unit": "°C",
      "limits": {
        "lower": 250,
        "upper": 260
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "AB17",
          "raw": 249
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "AB18",
          "raw": 239
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "AB19",
          "raw": 250
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "AB20",
          "raw": 250
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "AB21",
          "raw": 250
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "AB22",
          "raw": 249
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "AB23",
          "raw": 250
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "AB24",
          "raw": 250
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "AB25",
          "raw": "249,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "AB26",
          "raw": "255,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "AB27",
          "raw": 255
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "AB28",
          "raw": 255
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "AB29",
          "raw": 255
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "AB30",
          "raw": 255
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "AB31",
          "raw": 255
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "AB32",
          "raw": 255
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "AB33",
          "raw": 255
        }
      ],
      "excelSummary": [
        {
          "cell": "AB69",
          "formula": "=IF(AB17=\"\",\"\",MIN(AB17:AB67))",
          "cached": 239
        },
        {
          "cell": "AB70",
          "formula": "=IF(AB17=\"\",\"\",MAX(AB17:AB67))",
          "cached": 255
        },
        {
          "cell": "AB71",
          "formula": "=IF(AB17=\"\",\"\",AVERAGE(AB17:AB67))",
          "cached": 251.46666666666667
        },
        {
          "cell": "AB72",
          "formula": "=IF(AB17=\"\",\"\",STDEVP(AB17:AB67))",
          "cached": 4.208985098043891
        },
        {
          "cell": "AB73",
          "formula": "=IF(AB17=\"\",\"\",(AB11-AB10)/6/AB72)",
          "cached": 0.39597827691080284
        },
        {
          "cell": "AB74",
          "formula": "=IF(AB17=\"\",\"\",MIN(((AB11-AB71)/3/AB72),((AB71-AB10)/3/AB72)))",
          "cached": 0.11615362789383565
        }
      ]
    },
    {
      "code": "MSA_AD",
      "column": "AD",
      "name": "Aquecimento   Z12",
      "unit": "°C",
      "limits": {
        "lower": 260,
        "upper": 270
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "AD17",
          "raw": 260
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "AD18",
          "raw": 248
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "AD19",
          "raw": 260
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "AD20",
          "raw": 260
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "AD21",
          "raw": 260
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "AD22",
          "raw": 259
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "AD23",
          "raw": 261
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "AD24",
          "raw": 260
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "AD25",
          "raw": "259,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "AD26",
          "raw": "255,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "AD27",
          "raw": 255
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "AD28",
          "raw": 255
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "AD29",
          "raw": 256
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "AD30",
          "raw": 256
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "AD31",
          "raw": 261
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "AD32",
          "raw": 262
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "AD33",
          "raw": 261
        }
      ],
      "excelSummary": [
        {
          "cell": "AD69",
          "formula": "=IF(AD17=\"\",\"\",MIN(AD17:AD67))",
          "cached": 248
        },
        {
          "cell": "AD70",
          "formula": "=IF(AD17=\"\",\"\",MAX(AD17:AD67))",
          "cached": 262
        },
        {
          "cell": "AD71",
          "formula": "=IF(AD17=\"\",\"\",AVERAGE(AD17:AD67))",
          "cached": 258.26666666666665
        },
        {
          "cell": "AD72",
          "formula": "=IF(AD17=\"\",\"\",STDEVP(AD17:AD67))",
          "cached": 3.5490217744549772
        },
        {
          "cell": "AD73",
          "formula": "=IF(AD17=\"\",\"\",(AD11-AD10)/6/AD72)",
          "cached": 0.46961297297834037
        },
        {
          "cell": "AD74",
          "formula": "=IF(AD17=\"\",\"\",MIN(((AD11-AD71)/3/AD72),((AD71-AD10)/3/AD72)))",
          "cached": -0.16279916396582608
        }
      ]
    },
    {
      "code": "MSA_AF",
      "column": "AF",
      "name": "Aquecimento  Z13",
      "unit": "°C",
      "limits": {
        "lower": 260,
        "upper": 270
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "AF17",
          "raw": 260
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "AF18",
          "raw": 251
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "AF19",
          "raw": 259
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "AF20",
          "raw": 260
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "AF21",
          "raw": 260
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "AF22",
          "raw": 260
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "AF23",
          "raw": 270
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "AF24",
          "raw": 270
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "AF25",
          "raw": "269,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "AF26",
          "raw": "264,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "AF27",
          "raw": 255
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "AF28",
          "raw": 94
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "AF29",
          "raw": 255
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "AF30",
          "raw": 255
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "AF31",
          "raw": 260
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "AF32",
          "raw": 260
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "AF33",
          "raw": 260
        }
      ],
      "excelSummary": [
        {
          "cell": "AF69",
          "formula": "=IF(AF17=\"\",\"\",MIN(AF17:AF67))",
          "cached": 94
        },
        {
          "cell": "AF70",
          "formula": "=IF(AF17=\"\",\"\",MAX(AF17:AF67))",
          "cached": 270
        },
        {
          "cell": "AF71",
          "formula": "=IF(AF17=\"\",\"\",AVERAGE(AF17:AF67))",
          "cached": 248.6
        },
        {
          "cell": "AF72",
          "formula": "=IF(AF17=\"\",\"\",STDEVP(AF17:AF67))",
          "cached": 41.604166458020366
        },
        {
          "cell": "AF73",
          "formula": "=IF(AF17=\"\",\"\",(AF11-AF10)/6/AF72)",
          "cached": 0.04006009033610551
        },
        {
          "cell": "AF74",
          "formula": "=IF(AF17=\"\",\"\",MIN(((AF11-AF71)/3/AF72),((AF71-AF10)/3/AF72)))",
          "cached": -0.0913370059663206
        }
      ]
    },
    {
      "code": "MSA_AH",
      "column": "AH",
      "name": "Aquecimento Z14",
      "unit": "°C",
      "limits": {
        "lower": 255,
        "upper": 265
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "AH17",
          "raw": 251
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "AH18",
          "raw": 241
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "AH19",
          "raw": 263
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "AH20",
          "raw": 263
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "AH21",
          "raw": 262
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "AH22",
          "raw": 252
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "AH23",
          "raw": 267
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "AH24",
          "raw": 270
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "AH25",
          "raw": "265,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "AH26",
          "raw": "271,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "AH27",
          "raw": 267
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "AH28",
          "raw": 101
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "AH29",
          "raw": 253
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "AH30",
          "raw": 253
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "AH31",
          "raw": 258
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "AH32",
          "raw": 261
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "AH33",
          "raw": 261
        }
      ],
      "excelSummary": [
        {
          "cell": "AH69",
          "formula": "=IF(AH17=\"\",\"\",MIN(AH17:AH67))",
          "cached": 101
        },
        {
          "cell": "AH70",
          "formula": "=IF(AH17=\"\",\"\",MAX(AH17:AH67))",
          "cached": 270
        },
        {
          "cell": "AH71",
          "formula": "=IF(AH17=\"\",\"\",AVERAGE(AH17:AH67))",
          "cached": 248.2
        },
        {
          "cell": "AH72",
          "formula": "=IF(AH17=\"\",\"\",STDEVP(AH17:AH67))",
          "cached": 40.01866231314252
        },
        {
          "cell": "AH73",
          "formula": "=IF(AH17=\"\",\"\",(AH11-AH10)/6/AH72)",
          "cached": 0.04164723582275555
        },
        {
          "cell": "AH74",
          "formula": "=IF(AH17=\"\",\"\",MIN(((AH11-AH71)/3/AH72),((AH71-AH10)/3/AH72)))",
          "cached": -0.056640240718947646
        }
      ]
    },
    {
      "code": "MSA_AJ",
      "column": "AJ",
      "name": "Aquecimento Z15",
      "unit": "°C",
      "limits": {
        "lower": 270,
        "upper": 280
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "AJ17",
          "raw": 269
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "AJ18",
          "raw": 251
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "AJ19",
          "raw": 270
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "AJ20",
          "raw": 266
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "AJ21",
          "raw": 260
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "AJ22",
          "raw": 254
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "AJ23",
          "raw": 270
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "AJ24",
          "raw": 270
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "AJ25",
          "raw": "269,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "AJ26",
          "raw": "270,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "AJ27",
          "raw": 285
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "AJ28",
          "raw": 255
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "AJ29",
          "raw": 280
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "AJ30",
          "raw": 280
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "AJ31",
          "raw": 280
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "AJ32",
          "raw": 280
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "AJ33",
          "raw": 280
        }
      ],
      "excelSummary": [
        {
          "cell": "AJ69",
          "formula": "=IF(AJ17=\"\",\"\",MIN(AJ17:AJ67))",
          "cached": 251
        },
        {
          "cell": "AJ70",
          "formula": "=IF(AJ17=\"\",\"\",MAX(AJ17:AJ67))",
          "cached": 285
        },
        {
          "cell": "AJ71",
          "formula": "=IF(AJ17=\"\",\"\",AVERAGE(AJ17:AJ67))",
          "cached": 270
        },
        {
          "cell": "AJ72",
          "formula": "=IF(AJ17=\"\",\"\",STDEVP(AJ17:AJ67))",
          "cached": 10.595596569644707
        },
        {
          "cell": "AJ73",
          "formula": "=IF(AJ17=\"\",\"\",(AJ11-AJ10)/6/AJ72)",
          "cached": 0.1572980488367682
        },
        {
          "cell": "AJ74",
          "formula": "=IF(AJ17=\"\",\"\",MIN(((AJ11-AJ71)/3/AJ72),((AJ71-AJ10)/3/AJ72)))",
          "cached": 0
        }
      ]
    },
    {
      "code": "MSA_AL",
      "column": "AL",
      "name": "Aquecimento Z16",
      "unit": "°C",
      "limits": {
        "lower": 270,
        "upper": 280
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "AL17",
          "raw": 269
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "AL18",
          "raw": 248
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "AL19",
          "raw": 268
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "AL20",
          "raw": 265
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "AL21",
          "raw": 260
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "AL22",
          "raw": 256
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "AL23",
          "raw": 273
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "AL24",
          "raw": 270
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "AL25",
          "raw": "269,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "AL26",
          "raw": "268,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "AL27",
          "raw": 285
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "AL28",
          "raw": 255
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "AL29",
          "raw": 280
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "AL30",
          "raw": 280
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "AL31",
          "raw": 280
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "AL32",
          "raw": 280
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "AL33",
          "raw": 280
        }
      ],
      "excelSummary": [
        {
          "cell": "AL69",
          "formula": "=IF(AL17=\"\",\"\",MIN(AL17:AL67))",
          "cached": 248
        },
        {
          "cell": "AL70",
          "formula": "=IF(AL17=\"\",\"\",MAX(AL17:AL67))",
          "cached": 285
        },
        {
          "cell": "AL71",
          "formula": "=IF(AL17=\"\",\"\",AVERAGE(AL17:AL67))",
          "cached": 269.93333333333334
        },
        {
          "cell": "AL72",
          "formula": "=IF(AL17=\"\",\"\",STDEVP(AL17:AL67))",
          "cached": 10.859506843724024
        },
        {
          "cell": "AL73",
          "formula": "=IF(AL17=\"\",\"\",(AL11-AL10)/6/AL72)",
          "cached": 0.15347535488039904
        },
        {
          "cell": "AL74",
          "formula": "=IF(AL17=\"\",\"\",MIN(((AL11-AL71)/3/AL72),((AL71-AL10)/3/AL72)))",
          "cached": -0.002046338065071871
        }
      ]
    },
    {
      "code": "MSA_AN",
      "column": "AN",
      "name": "Aquecimento Z17",
      "unit": "°C",
      "limits": {
        "lower": 270,
        "upper": 280
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "AN17",
          "raw": 271
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "AN18",
          "raw": 244
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "AN19",
          "raw": 269
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "AN20",
          "raw": 265
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "AN21",
          "raw": 260
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "AN22",
          "raw": 255
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "AN23",
          "raw": 274
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "AN24",
          "raw": 275
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "AN25",
          "raw": "274,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "AN26",
          "raw": "268,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "AN27",
          "raw": 274
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "AN28",
          "raw": 280
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "AN29",
          "raw": 280
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "AN30",
          "raw": 280
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "AN31",
          "raw": 280
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "AN32",
          "raw": 280
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "AN33",
          "raw": 280
        }
      ],
      "excelSummary": [
        {
          "cell": "AN69",
          "formula": "=IF(AN17=\"\",\"\",MIN(AN17:AN67))",
          "cached": 244
        },
        {
          "cell": "AN70",
          "formula": "=IF(AN17=\"\",\"\",MAX(AN17:AN67))",
          "cached": 280
        },
        {
          "cell": "AN71",
          "formula": "=IF(AN17=\"\",\"\",AVERAGE(AN17:AN67))",
          "cached": 271.1333333333333
        },
        {
          "cell": "AN72",
          "formula": "=IF(AN17=\"\",\"\",STDEVP(AN17:AN67))",
          "cached": 10.53797366142509
        },
        {
          "cell": "AN73",
          "formula": "=IF(AN17=\"\",\"\",(AN11-AN10)/6/AN72)",
          "cached": 0.1581581734985355
        },
        {
          "cell": "AN74",
          "formula": "=IF(AN17=\"\",\"\",MIN(((AN11-AN71)/3/AN72),((AN71-AN10)/3/AN72)))",
          "cached": 0.03584918599300114
        }
      ]
    },
    {
      "code": "MSA_AP",
      "column": "AP",
      "name": "Aquecimento Z18",
      "unit": "°C",
      "limits": {
        "lower": 0,
        "upper": 0
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "AP17",
          "raw": 76
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "AP18",
          "raw": 72
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "AP19",
          "raw": 73
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "AP20",
          "raw": 77
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "AP21",
          "raw": 74
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "AP22",
          "raw": 78
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "AP23",
          "raw": 74
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "AP24",
          "raw": 74
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "AP25",
          "raw": "76,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "AP26",
          "raw": "79,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "AP27",
          "raw": 74
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "AP28",
          "raw": 79
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "AP29",
          "raw": 78
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "AP30",
          "raw": 78
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "AP31",
          "raw": 74
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "AP32",
          "raw": 77
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "AP33",
          "raw": 77
        }
      ],
      "excelSummary": [
        {
          "cell": "AP69",
          "formula": "=IF(AP17=\"\",\"\",MIN(AP17:AP67))",
          "cached": 72
        },
        {
          "cell": "AP70",
          "formula": "=IF(AP17=\"\",\"\",MAX(AP17:AP67))",
          "cached": 79
        },
        {
          "cell": "AP71",
          "formula": "=IF(AP17=\"\",\"\",AVERAGE(AP17:AP67))",
          "cached": 75.66666666666667
        },
        {
          "cell": "AP72",
          "formula": "=IF(AP17=\"\",\"\",STDEVP(AP17:AP67))",
          "cached": 2.1186998109427604
        },
        {
          "cell": "AP73",
          "formula": "=IF(AP17=\"\",\"\",(AP11-AP10)/6/AP72)",
          "cached": 0
        },
        {
          "cell": "AP74",
          "formula": "=IF(AP17=\"\",\"\",MIN(((AP11-AP71)/3/AP72),((AP71-AP10)/3/AP72)))",
          "cached": -11.904575670396206
        }
      ]
    },
    {
      "code": "MSA_AR",
      "column": "AR",
      "name": "Aquecimento Z19",
      "unit": "°C",
      "limits": {
        "lower": 285,
        "upper": 295
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "AR17",
          "raw": 280
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "AR18",
          "raw": 264
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "AR19",
          "raw": 283
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "AR20",
          "raw": 283
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "AR21",
          "raw": 285
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "AR22",
          "raw": 281
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "AR23",
          "raw": 280
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "AR24",
          "raw": 275
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "AR25",
          "raw": "272,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "AR26",
          "raw": "270,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "AR27",
          "raw": 262
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "AR28",
          "raw": 270
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "AR29",
          "raw": 270
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "AR30",
          "raw": 270
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "AR31",
          "raw": 269
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "AR32",
          "raw": 271
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "AR33",
          "raw": 269
        }
      ],
      "excelSummary": [
        {
          "cell": "AR69",
          "formula": "=IF(AR17=\"\",\"\",MIN(AR17:AR67))",
          "cached": 262
        },
        {
          "cell": "AR70",
          "formula": "=IF(AR17=\"\",\"\",MAX(AR17:AR67))",
          "cached": 285
        },
        {
          "cell": "AR71",
          "formula": "=IF(AR17=\"\",\"\",AVERAGE(AR17:AR67))",
          "cached": 274.1333333333333
        },
        {
          "cell": "AR72",
          "formula": "=IF(AR17=\"\",\"\",STDEVP(AR17:AR67))",
          "cached": 7.098043548909954
        },
        {
          "cell": "AR73",
          "formula": "=IF(AR17=\"\",\"\",(AR11-AR10)/6/AR72)",
          "cached": 0.2348064864891702
        },
        {
          "cell": "AR74",
          "formula": "=IF(AR17=\"\",\"\",MIN(((AR11-AR71)/3/AR72),((AR71-AR10)/3/AR72)))",
          "cached": -0.510312763969797
        }
      ]
    },
    {
      "code": "MSA_AT",
      "column": "AT",
      "name": "Aquecimento Z20",
      "unit": "°C",
      "limits": {
        "lower": 300,
        "upper": 310
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "AT17",
          "raw": 296
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "AT18",
          "raw": 278
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "AT19",
          "raw": 304
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "AT20",
          "raw": 302
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "AT21",
          "raw": 300
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "AT22",
          "raw": 306
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "AT23",
          "raw": 306
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "AT24",
          "raw": 310
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "AT25",
          "raw": "309,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "AT26",
          "raw": "305,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "AT27",
          "raw": 304
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "AT28",
          "raw": 307
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "AT29",
          "raw": 308
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "AT30",
          "raw": 308
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "AT31",
          "raw": 307
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "AT32",
          "raw": 309
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "AT33",
          "raw": 307
        }
      ],
      "excelSummary": [
        {
          "cell": "AT69",
          "formula": "=IF(AT17=\"\",\"\",MIN(AT17:AT67))",
          "cached": 278
        },
        {
          "cell": "AT70",
          "formula": "=IF(AT17=\"\",\"\",MAX(AT17:AT67))",
          "cached": 310
        },
        {
          "cell": "AT71",
          "formula": "=IF(AT17=\"\",\"\",AVERAGE(AT17:AT67))",
          "cached": 303.46666666666664
        },
        {
          "cell": "AT72",
          "formula": "=IF(AT17=\"\",\"\",STDEVP(AT17:AT67))",
          "cached": 7.67564691446627
        },
        {
          "cell": "AT73",
          "formula": "=IF(AT17=\"\",\"\",(AT11-AT10)/6/AT72)",
          "cached": 0.21713696385975034
        },
        {
          "cell": "AT74",
          "formula": "=IF(AT17=\"\",\"\",MIN(((AT11-AT71)/3/AT72),((AT71-AT10)/3/AT72)))",
          "cached": 0.1505482949427591
        }
      ]
    },
    {
      "code": "MSA_AV",
      "column": "AV",
      "name": "Aquecimento Z21",
      "unit": "°C",
      "limits": {
        "lower": 310,
        "upper": 320
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "AV17",
          "raw": 298
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "AV18",
          "raw": 278
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "AV19",
          "raw": 304
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "AV20",
          "raw": 304
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "AV21",
          "raw": 305
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "AV22",
          "raw": 297
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "AV23",
          "raw": 299
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "AV24",
          "raw": 310
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "AV25",
          "raw": "299,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "AV26",
          "raw": "303,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "AV27",
          "raw": 296
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "AV28",
          "raw": 308
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "AV29",
          "raw": 305
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "AV30",
          "raw": 303
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "AV31",
          "raw": 306
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "AV32",
          "raw": 309
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "AV33",
          "raw": 307
        }
      ],
      "excelSummary": [
        {
          "cell": "AV69",
          "formula": "=IF(AV17=\"\",\"\",MIN(AV17:AV67))",
          "cached": 278
        },
        {
          "cell": "AV70",
          "formula": "=IF(AV17=\"\",\"\",MAX(AV17:AV67))",
          "cached": 310
        },
        {
          "cell": "AV71",
          "formula": "=IF(AV17=\"\",\"\",AVERAGE(AV17:AV67))",
          "cached": 301.93333333333334
        },
        {
          "cell": "AV72",
          "formula": "=IF(AV17=\"\",\"\",STDEVP(AV17:AV67))",
          "cached": 7.654773383683903
        },
        {
          "cell": "AV73",
          "formula": "=IF(AV17=\"\",\"\",(AV11-AV10)/6/AV72)",
          "cached": 0.21772906696613062
        },
        {
          "cell": "AV74",
          "formula": "=IF(AV17=\"\",\"\",MIN(((AV11-AV71)/3/AV72),((AV71-AV10)/3/AV72)))",
          "cached": -0.3512695613720239
        }
      ]
    },
    {
      "code": "MSA_AX",
      "column": "AX",
      "name": "Medida do Passo",
      "unit": "mm",
      "limits": {
        "lower": 412,
        "upper": 415
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "AX17",
          "raw": 412
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "AX18",
          "raw": 412
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "AX19",
          "raw": 412
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "AX20",
          "raw": 412
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "AX21",
          "raw": 412
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "AX22",
          "raw": 412
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "AX23",
          "raw": 410
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "AX24",
          "raw": 415
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "AX25",
          "raw": "415,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "AX26",
          "raw": "415,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "AX27",
          "raw": 412
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "AX28",
          "raw": 412
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "AX29",
          "raw": 412
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "AX30",
          "raw": 412
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "AX31",
          "raw": 412
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "AX32",
          "raw": 412
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "AX33",
          "raw": 412
        }
      ],
      "excelSummary": [
        {
          "cell": "AX69",
          "formula": "=IF(AX17=\"\",\"\",MIN(AX17:AX67))",
          "cached": 410
        },
        {
          "cell": "AX70",
          "formula": "=IF(AX17=\"\",\"\",MAX(AX17:AX67))",
          "cached": 415
        },
        {
          "cell": "AX71",
          "formula": "=IF(AX17=\"\",\"\",AVERAGE(AX17:AX67))",
          "cached": 412.06666666666666
        },
        {
          "cell": "AX72",
          "formula": "=IF(AX17=\"\",\"\",STDEVP(AX17:AX67))",
          "cached": 0.9285592184789411
        },
        {
          "cell": "AX73",
          "formula": "=IF(AX17=\"\",\"\",(AX11-AX10)/6/AX72)",
          "cached": 0.5384686189633037
        },
        {
          "cell": "AX74",
          "formula": "=IF(AX17=\"\",\"\",MIN(((AX11-AX71)/3/AX72),((AX71-AX10)/3/AX72)))",
          "cached": 0.023931938620589916
        }
      ]
    },
    {
      "code": "MSA_AZ",
      "column": "AZ",
      "name": "Velocidade do Passo",
      "unit": "%",
      "limits": {
        "lower": 19,
        "upper": 20
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "AZ17",
          "raw": 19
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "AZ18",
          "raw": 19
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "AZ19",
          "raw": 19
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "AZ20",
          "raw": 19
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "AZ21",
          "raw": 19
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "AZ22",
          "raw": 19
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "AZ23",
          "raw": 19
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "AZ24",
          "raw": 19
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "AZ25",
          "raw": "19,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "AZ26",
          "raw": "19,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "AZ27",
          "raw": 19
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "AZ28",
          "raw": 19
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "AZ29",
          "raw": 19
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "AZ30",
          "raw": 19
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "AZ31",
          "raw": 19
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "AZ32",
          "raw": 19
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "AZ33",
          "raw": 19
        }
      ],
      "excelSummary": [
        {
          "cell": "AZ69",
          "formula": "=IF(AZ17=\"\",\"\",MIN(AZ17:AZ67))",
          "cached": 19
        },
        {
          "cell": "AZ70",
          "formula": "=IF(AZ17=\"\",\"\",MAX(AZ17:AZ67))",
          "cached": 19
        },
        {
          "cell": "AZ71",
          "formula": "=IF(AZ17=\"\",\"\",AVERAGE(AZ17:AZ67))",
          "cached": 19
        },
        {
          "cell": "AZ72",
          "formula": "=IF(AZ17=\"\",\"\",STDEVP(AZ17:AZ67))",
          "cached": 0
        },
        {
          "cell": "AZ73",
          "formula": "=IF(AZ17=\"\",\"\",(AZ11-AZ10)/6/AZ72)",
          "cached": "#DIV/0!"
        },
        {
          "cell": "AZ74",
          "formula": "=IF(AZ17=\"\",\"\",MIN(((AZ11-AZ71)/3/AZ72),((AZ71-AZ10)/3/AZ72)))",
          "cached": "#DIV/0!"
        }
      ]
    },
    {
      "code": "MSA_BB",
      "column": "BB",
      "name": "Tempo de Vacuo",
      "unit": "seg",
      "limits": {
        "lower": 75,
        "upper": 85
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "BB17",
          "raw": 70
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "BB18",
          "raw": 85
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "BB19",
          "raw": 85
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "BB20",
          "raw": 75
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "BB21",
          "raw": 70
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "BB22",
          "raw": 75
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "BB23",
          "raw": 75
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "BB24",
          "raw": 90
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "BB25",
          "raw": "95,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "BB26",
          "raw": "85,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "BB27",
          "raw": 90
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "BB28",
          "raw": 90
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "BB29",
          "raw": 80
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "BB30",
          "raw": 80
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "BB31",
          "raw": 90
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "BB32",
          "raw": 90
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "BB33",
          "raw": 85
        }
      ],
      "excelSummary": [
        {
          "cell": "BB69",
          "formula": "=IF(BB17=\"\",\"\",MIN(BB17:BB67))",
          "cached": 70
        },
        {
          "cell": "BB70",
          "formula": "=IF(BB17=\"\",\"\",MAX(BB17:BB67))",
          "cached": 90
        },
        {
          "cell": "BB71",
          "formula": "=IF(BB17=\"\",\"\",AVERAGE(BB17:BB67))",
          "cached": 82
        },
        {
          "cell": "BB72",
          "formula": "=IF(BB17=\"\",\"\",STDEVP(BB17:BB67))",
          "cached": 7.2571803523590805
        },
        {
          "cell": "BB73",
          "formula": "=IF(BB17=\"\",\"\",(BB11-BB10)/6/BB72)",
          "cached": 0.22965760608731267
        },
        {
          "cell": "BB74",
          "formula": "=IF(BB17=\"\",\"\",MIN(((BB11-BB71)/3/BB72),((BB71-BB10)/3/BB72)))",
          "cached": 0.1377945636523876
        }
      ]
    },
    {
      "code": "MSA_BD",
      "column": "BD",
      "name": "Tempo de Resfriamento",
      "unit": "seg",
      "limits": {
        "lower": 35,
        "upper": 36
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "BD17",
          "raw": 35
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "BD18",
          "raw": 35
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "BD19",
          "raw": 35
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "BD20",
          "raw": 35
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "BD21",
          "raw": 35
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "BD22",
          "raw": 35
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "BD23",
          "raw": 35
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "BD24",
          "raw": 35
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "BD25",
          "raw": "35,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "BD26",
          "raw": "35,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "BD27",
          "raw": 20
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "BD28",
          "raw": 15
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "BD29",
          "raw": 15
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "BD30",
          "raw": 15
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "BD31",
          "raw": 15
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "BD32",
          "raw": 15
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "BD33",
          "raw": 15
        }
      ],
      "excelSummary": [
        {
          "cell": "BD69",
          "formula": "=IF(BD17=\"\",\"\",MIN(BD17:BD67))",
          "cached": 15
        },
        {
          "cell": "BD70",
          "formula": "=IF(BD17=\"\",\"\",MAX(BD17:BD67))",
          "cached": 35
        },
        {
          "cell": "BD71",
          "formula": "=IF(BD17=\"\",\"\",AVERAGE(BD17:BD67))",
          "cached": 26
        },
        {
          "cell": "BD72",
          "formula": "=IF(BD17=\"\",\"\",STDEVP(BD17:BD67))",
          "cached": 9.695359714832659
        },
        {
          "cell": "BD73",
          "formula": "=IF(BD17=\"\",\"\",(BD11-BD10)/6/BD72)",
          "cached": 0.017190354104313223
        },
        {
          "cell": "BD74",
          "formula": "=IF(BD17=\"\",\"\",MIN(((BD11-BD71)/3/BD72),((BD71-BD10)/3/BD72)))",
          "cached": -0.309426373877638
        }
      ]
    },
    {
      "code": "MSA_BF",
      "column": "BF",
      "name": "Tempo destacar",
      "unit": "seg",
      "limits": {
        "lower": 0.8,
        "upper": 0.9
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "BF17",
          "raw": "0,8"
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "BF18",
          "raw": "0,8"
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "BF19",
          "raw": "0,8"
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "BF20",
          "raw": "0,8"
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "BF21",
          "raw": "0,8"
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "BF22",
          "raw": "0,8"
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "BF23",
          "raw": "0,8"
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "BF24",
          "raw": "0,9"
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "BF25",
          "raw": "0,9"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "BF26",
          "raw": "0,90"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "BF27",
          "raw": 0.9
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "BF28",
          "raw": 0.9
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "BF29",
          "raw": 0.9
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "BF30",
          "raw": 0.9
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "BF31",
          "raw": 0.9
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "BF32",
          "raw": 0.9
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "BF33",
          "raw": 0.9
        }
      ],
      "excelSummary": [
        {
          "cell": "BF69",
          "formula": "=IF(BF17=\"\",\"\",MIN(BF17:BF67))",
          "cached": 0.9
        },
        {
          "cell": "BF70",
          "formula": "=IF(BF17=\"\",\"\",MAX(BF17:BF67))",
          "cached": 0.9
        },
        {
          "cell": "BF71",
          "formula": "=IF(BF17=\"\",\"\",AVERAGE(BF17:BF67))",
          "cached": 0.9000000000000001
        },
        {
          "cell": "BF72",
          "formula": "=IF(BF17=\"\",\"\",STDEVP(BF17:BF67))",
          "cached": 1.1102230246251565e-16
        },
        {
          "cell": "BF73",
          "formula": "=IF(BF17=\"\",\"\",(BF11-BF10)/6/BF72)",
          "cached": 150119987579016.5
        },
        {
          "cell": "BF74",
          "formula": "=IF(BF17=\"\",\"\",MIN(((BF11-BF71)/3/BF72),((BF71-BF10)/3/BF72)))",
          "cached": -0.3333333333333333
        }
      ]
    },
    {
      "code": "MSA_BH",
      "column": "BH",
      "name": "Tempo Contra molde",
      "unit": "seg",
      "limits": {
        "lower": 80,
        "upper": 75
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "BH17",
          "raw": 75
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "BH18",
          "raw": 90
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "BH19",
          "raw": 90
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "BH20",
          "raw": 80
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "BH21",
          "raw": 75
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "BH22",
          "raw": 80
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "BH23",
          "raw": 80
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "BH24",
          "raw": 95
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "BH25",
          "raw": "100,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "BH26",
          "raw": "90,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "BH27",
          "raw": 95
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "BH28",
          "raw": 95
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "BH29",
          "raw": 85
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "BH30",
          "raw": 85
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "BH31",
          "raw": 95
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "BH32",
          "raw": 95
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "BH33",
          "raw": 90
        }
      ],
      "excelSummary": [
        {
          "cell": "BH69",
          "formula": "=IF(BH17=\"\",\"\",MIN(BH17:BH67))",
          "cached": 75
        },
        {
          "cell": "BH70",
          "formula": "=IF(BH17=\"\",\"\",MAX(BH17:BH67))",
          "cached": 95
        },
        {
          "cell": "BH71",
          "formula": "=IF(BH17=\"\",\"\",AVERAGE(BH17:BH67))",
          "cached": 87
        },
        {
          "cell": "BH72",
          "formula": "=IF(BH17=\"\",\"\",STDEVP(BH17:BH67))",
          "cached": 7.2571803523590805
        },
        {
          "cell": "BH73",
          "formula": "=IF(BH17=\"\",\"\",(BH11-BH10)/6/BH72)",
          "cached": -0.11482880304365634
        },
        {
          "cell": "BH74",
          "formula": "=IF(BH17=\"\",\"\",MIN(((BH11-BH71)/3/BH72),((BH71-BH10)/3/BH72)))",
          "cached": -0.5511782546095504
        }
      ]
    },
    {
      "code": "MSA_BJ",
      "column": "BJ",
      "name": "Tempo prensa corte",
      "unit": "seg",
      "limits": {
        "lower": 10,
        "upper": 15
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "BJ17",
          "raw": 10
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "BJ18",
          "raw": 10
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "BJ19",
          "raw": 10
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "BJ20",
          "raw": 10
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "BJ21",
          "raw": 10
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "BJ22",
          "raw": 10
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "BJ23",
          "raw": 11
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "BJ24",
          "raw": 11
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "BJ25",
          "raw": "11,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "BJ26",
          "raw": "11,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "BJ27",
          "raw": 11
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "BJ28",
          "raw": 11
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "BJ29",
          "raw": 11
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "BJ30",
          "raw": 11
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "BJ31",
          "raw": 11
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "BJ32",
          "raw": 11
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "BJ33",
          "raw": 11
        }
      ],
      "excelSummary": [
        {
          "cell": "BJ69",
          "formula": "=IF(BJ17=\"\",\"\",MIN(BJ17:BJ67))",
          "cached": 10
        },
        {
          "cell": "BJ70",
          "formula": "=IF(BJ17=\"\",\"\",MAX(BJ17:BJ67))",
          "cached": 11
        },
        {
          "cell": "BJ71",
          "formula": "=IF(BJ17=\"\",\"\",AVERAGE(BJ17:BJ67))",
          "cached": 10.6
        },
        {
          "cell": "BJ72",
          "formula": "=IF(BJ17=\"\",\"\",STDEVP(BJ17:BJ67))",
          "cached": 0.48989794855663554
        },
        {
          "cell": "BJ73",
          "formula": "=IF(BJ17=\"\",\"\",(BJ11-BJ10)/6/BJ72)",
          "cached": 1.7010345435994296
        },
        {
          "cell": "BJ74",
          "formula": "=IF(BJ17=\"\",\"\",MIN(((BJ11-BJ71)/3/BJ72),((BJ71-BJ10)/3/BJ72)))",
          "cached": 0.4082482904638628
        }
      ]
    },
    {
      "code": "MSA_BL",
      "column": "BL",
      "name": "Tempo de esteira saida",
      "unit": "seg",
      "limits": {
        "lower": 28,
        "upper": 30
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "BL17",
          "raw": 28
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "BL18",
          "raw": 28
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "BL19",
          "raw": 28
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "BL20",
          "raw": 28
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "BL21",
          "raw": 28
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "BL22",
          "raw": 28
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "BL23",
          "raw": 28
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "BL24",
          "raw": 30
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "BL25",
          "raw": "30,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "BL26",
          "raw": "30,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "BL27",
          "raw": 35
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "BL28",
          "raw": 35
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "BL29",
          "raw": 35
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "BL30",
          "raw": 35
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "BL31",
          "raw": 35
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "BL32",
          "raw": 35
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "BL33",
          "raw": 35
        }
      ],
      "excelSummary": [
        {
          "cell": "BL69",
          "formula": "=IF(BL17=\"\",\"\",MIN(BL17:BL67))",
          "cached": 28
        },
        {
          "cell": "BL70",
          "formula": "=IF(BL17=\"\",\"\",MAX(BL17:BL67))",
          "cached": 35
        },
        {
          "cell": "BL71",
          "formula": "=IF(BL17=\"\",\"\",AVERAGE(BL17:BL67))",
          "cached": 31.4
        },
        {
          "cell": "BL72",
          "formula": "=IF(BL17=\"\",\"\",STDEVP(BL17:BL67))",
          "cached": 3.401960219246153
        },
        {
          "cell": "BL73",
          "formula": "=IF(BL17=\"\",\"\",(BL11-BL10)/6/BL72)",
          "cached": 0.09798272520870255
        },
        {
          "cell": "BL74",
          "formula": "=IF(BL17=\"\",\"\",MIN(((BL11-BL71)/3/BL72),((BL71-BL10)/3/BL72)))",
          "cached": -0.13717581529218345
        }
      ]
    },
    {
      "code": "MSA_BN",
      "column": "BN",
      "name": "Retardo de Passo",
      "unit": "seg",
      "limits": {
        "lower": 1,
        "upper": 2
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "BN17",
          "raw": 1
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "BN18",
          "raw": 1
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "BN19",
          "raw": 1
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "BN20",
          "raw": 1
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "BN21",
          "raw": 1
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "BN22",
          "raw": 1
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "BN23",
          "raw": 1
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "BN24",
          "raw": 1
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "BN25",
          "raw": "1,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "BN26",
          "raw": "1,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "BN27",
          "raw": 2
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "BN28",
          "raw": 2
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "BN29",
          "raw": 2
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "BN30",
          "raw": 2
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "BN31",
          "raw": 2
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "BN32",
          "raw": 2
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "BN33",
          "raw": 2
        }
      ],
      "excelSummary": [
        {
          "cell": "BN69",
          "formula": "=IF(BN17=\"\",\"\",MIN(BN17:BN67))",
          "cached": 1
        },
        {
          "cell": "BN70",
          "formula": "=IF(BN17=\"\",\"\",MAX(BN17:BN67))",
          "cached": 2
        },
        {
          "cell": "BN71",
          "formula": "=IF(BN17=\"\",\"\",AVERAGE(BN17:BN67))",
          "cached": 1.4666666666666666
        },
        {
          "cell": "BN72",
          "formula": "=IF(BN17=\"\",\"\",STDEVP(BN17:BN67))",
          "cached": 0.49888765156985887
        },
        {
          "cell": "BN73",
          "formula": "=IF(BN17=\"\",\"\",(BN11-BN10)/6/BN72)",
          "cached": 0.33407655239053047
        },
        {
          "cell": "BN74",
          "formula": "=IF(BN17=\"\",\"\",MIN(((BN11-BN71)/3/BN72),((BN71-BN10)/3/BN72)))",
          "cached": 0.3118047822311617
        }
      ]
    },
    {
      "code": "MSA_BP",
      "column": "BP",
      "name": "Retardo de Mesa ",
      "unit": "seg",
      "limits": {
        "lower": 0.1,
        "upper": 1
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "BP17",
          "raw": "0,1"
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "BP18",
          "raw": "0,1"
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "BP19",
          "raw": "0,1"
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "BP20",
          "raw": "0,1"
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "BP21",
          "raw": "0,1"
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "BP22",
          "raw": "0,1"
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "BP23",
          "raw": "0,1"
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "BP24",
          "raw": "0,1"
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "BP25",
          "raw": "0,10"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "BP26",
          "raw": "0,10"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "BP27",
          "raw": 0.1
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "BP28",
          "raw": 0.1
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "BP29",
          "raw": 0.1
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "BP30",
          "raw": 0.1
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "BP31",
          "raw": 0.1
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "BP32",
          "raw": 0.1
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "BP33",
          "raw": 0.1
        }
      ],
      "excelSummary": [
        {
          "cell": "BP69",
          "formula": "=IF(BP17=\"\",\"\",MIN(BP17:BP67))",
          "cached": 0.1
        },
        {
          "cell": "BP70",
          "formula": "=IF(BP17=\"\",\"\",MAX(BP17:BP67))",
          "cached": 0.1
        },
        {
          "cell": "BP71",
          "formula": "=IF(BP17=\"\",\"\",AVERAGE(BP17:BP67))",
          "cached": 0.09999999999999999
        },
        {
          "cell": "BP72",
          "formula": "=IF(BP17=\"\",\"\",STDEVP(BP17:BP67))",
          "cached": 1.3877787807814457e-17
        },
        {
          "cell": "BP73",
          "formula": "=IF(BP17=\"\",\"\",(BP11-BP10)/6/BP72)",
          "cached": 1.080863910568919e+16
        },
        {
          "cell": "BP74",
          "formula": "=IF(BP17=\"\",\"\",MIN(((BP11-BP71)/3/BP72),((BP71-BP10)/3/BP72)))",
          "cached": -0.3333333333333333
        }
      ]
    },
    {
      "code": "MSA_BR",
      "column": "BR",
      "name": "Retardo de Vacuo",
      "unit": "seg",
      "limits": {
        "lower": 4,
        "upper": 5
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "BR17",
          "raw": 4
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "BR18",
          "raw": 4
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "BR19",
          "raw": 4
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "BR20",
          "raw": 4
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "BR21",
          "raw": 4
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "BR22",
          "raw": 4
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "BR23",
          "raw": 4
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "BR24",
          "raw": 5
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "BR25",
          "raw": "5,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "BR26",
          "raw": "5,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "BR27",
          "raw": 5
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "BR28",
          "raw": 5
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "BR29",
          "raw": 5
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "BR30",
          "raw": 5
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "BR31",
          "raw": 5
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "BR32",
          "raw": 5
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "BR33",
          "raw": 5
        }
      ],
      "excelSummary": [
        {
          "cell": "BR69",
          "formula": "=IF(BR17=\"\",\"\",MIN(BR17:BR67))",
          "cached": 4
        },
        {
          "cell": "BR70",
          "formula": "=IF(BR17=\"\",\"\",MAX(BR17:BR67))",
          "cached": 5
        },
        {
          "cell": "BR71",
          "formula": "=IF(BR17=\"\",\"\",AVERAGE(BR17:BR67))",
          "cached": 4.533333333333333
        },
        {
          "cell": "BR72",
          "formula": "=IF(BR17=\"\",\"\",STDEVP(BR17:BR67))",
          "cached": 0.49888765156985887
        },
        {
          "cell": "BR73",
          "formula": "=IF(BR17=\"\",\"\",(BR11-BR10)/6/BR72)",
          "cached": 0.33407655239053047
        },
        {
          "cell": "BR74",
          "formula": "=IF(BR17=\"\",\"\",MIN(((BR11-BR71)/3/BR72),((BR71-BR10)/3/BR72)))",
          "cached": 0.3118047822311618
        }
      ]
    },
    {
      "code": "MSA_BT",
      "column": "BT",
      "name": "Retardo de resfriamento",
      "unit": "seg",
      "limits": {
        "lower": 4,
        "upper": 5
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "BT17",
          "raw": 4
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "BT18",
          "raw": 4
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "BT19",
          "raw": 4
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "BT20",
          "raw": 4
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "BT21",
          "raw": 4
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "BT22",
          "raw": 4
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "BT23",
          "raw": 4
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "BT24",
          "raw": 4
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "BT25",
          "raw": "4,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "BT26",
          "raw": "4,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "BT27",
          "raw": 7
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "BT28",
          "raw": 30
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "BT29",
          "raw": 30
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "BT30",
          "raw": 30
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "BT31",
          "raw": 30
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "BT32",
          "raw": 30
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "BT33",
          "raw": 30
        }
      ],
      "excelSummary": [
        {
          "cell": "BT69",
          "formula": "=IF(BT17=\"\",\"\",MIN(BT17:BT67))",
          "cached": 4
        },
        {
          "cell": "BT70",
          "formula": "=IF(BT17=\"\",\"\",MAX(BT17:BT67))",
          "cached": 30
        },
        {
          "cell": "BT71",
          "formula": "=IF(BT17=\"\",\"\",AVERAGE(BT17:BT67))",
          "cached": 14.6
        },
        {
          "cell": "BT72",
          "formula": "=IF(BT17=\"\",\"\",STDEVP(BT17:BT67))",
          "cached": 12.59523719506703
        },
        {
          "cell": "BT73",
          "formula": "=IF(BT17=\"\",\"\",(BT11-BT10)/6/BT72)",
          "cached": 0.013232515123410478
        },
        {
          "cell": "BT74",
          "formula": "=IF(BT17=\"\",\"\",MIN(((BT11-BT71)/3/BT72),((BT71-BT10)/3/BT72)))",
          "cached": -0.2540642903694812
        }
      ]
    },
    {
      "code": "MSA_BV",
      "column": "BV",
      "name": "Retardo destacar",
      "unit": "seg",
      "limits": {
        "lower": 2,
        "upper": 5
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "BV17",
          "raw": 2
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "BV18",
          "raw": 2
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "BV19",
          "raw": 2
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "BV20",
          "raw": 2
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "BV21",
          "raw": 2
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "BV22",
          "raw": 2
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "BV23",
          "raw": 2
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "BV24",
          "raw": 1
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "BV25",
          "raw": "1,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "BV26",
          "raw": "1,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "BV27",
          "raw": 3
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "BV28",
          "raw": 3
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "BV29",
          "raw": 3
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "BV30",
          "raw": 3
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "BV31",
          "raw": 3
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "BV32",
          "raw": 3
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "BV33",
          "raw": 3
        }
      ],
      "excelSummary": [
        {
          "cell": "BV69",
          "formula": "=IF(BV17=\"\",\"\",MIN(BV17:BV67))",
          "cached": 1
        },
        {
          "cell": "BV70",
          "formula": "=IF(BV17=\"\",\"\",MAX(BV17:BV67))",
          "cached": 3
        },
        {
          "cell": "BV71",
          "formula": "=IF(BV17=\"\",\"\",AVERAGE(BV17:BV67))",
          "cached": 2.4
        },
        {
          "cell": "BV72",
          "formula": "=IF(BV17=\"\",\"\",STDEVP(BV17:BV67))",
          "cached": 0.6110100926607787
        },
        {
          "cell": "BV73",
          "formula": "=IF(BV17=\"\",\"\",(BV11-BV10)/6/BV72)",
          "cached": 0.8183170883849714
        },
        {
          "cell": "BV74",
          "formula": "=IF(BV17=\"\",\"\",MIN(((BV11-BV71)/3/BV72),((BV71-BV10)/3/BV72)))",
          "cached": 0.21821789023599233
        }
      ]
    },
    {
      "code": "MSA_BX",
      "column": "BX",
      "name": "Retardo Contra Molde",
      "unit": "seg",
      "limits": {
        "lower": 1.5,
        "upper": 5
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "BX17",
          "raw": "1,5"
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "BX18",
          "raw": "1,5"
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "BX19",
          "raw": "1,5"
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "BX20",
          "raw": "1,5"
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "BX21",
          "raw": "1,5"
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "BX22",
          "raw": "1,5"
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "BX23",
          "raw": "1,5"
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "BX24",
          "raw": "1,5"
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "BX25",
          "raw": "1,5"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "BX26",
          "raw": "1,50"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "BX27",
          "raw": 1
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "BX28",
          "raw": 1
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "BX29",
          "raw": 1
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "BX30",
          "raw": 1
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "BX31",
          "raw": 1.5
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "BX32",
          "raw": 1.5
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "BX33",
          "raw": 1.5
        }
      ],
      "excelSummary": [
        {
          "cell": "BX69",
          "formula": "=IF(BX17=\"\",\"\",MIN(BX17:BX67))",
          "cached": 1
        },
        {
          "cell": "BX70",
          "formula": "=IF(BX17=\"\",\"\",MAX(BX17:BX67))",
          "cached": 1.5
        },
        {
          "cell": "BX71",
          "formula": "=IF(BX17=\"\",\"\",AVERAGE(BX17:BX67))",
          "cached": 1.2142857142857142
        },
        {
          "cell": "BX72",
          "formula": "=IF(BX17=\"\",\"\",STDEVP(BX17:BX67))",
          "cached": 0.24743582965269675
        },
        {
          "cell": "BX73",
          "formula": "=IF(BX17=\"\",\"\",(BX11-BX10)/6/BX72)",
          "cached": 2.357513599190972
        },
        {
          "cell": "BX74",
          "formula": "=IF(BX17=\"\",\"\",MIN(((BX11-BX71)/3/BX72),((BX71-BX10)/3/BX72)))",
          "cached": -0.38490017945975064
        }
      ]
    },
    {
      "code": "MSA_BZ",
      "column": "BZ",
      "name": "Retardo Prensa Corte",
      "unit": "seg",
      "limits": {
        "lower": 9.5,
        "upper": 15
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "BZ17",
          "raw": "9,5"
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "BZ18",
          "raw": "9,5"
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "BZ19",
          "raw": "9,5"
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "BZ20",
          "raw": "9,5"
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "BZ21",
          "raw": "9,5"
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "BZ22",
          "raw": "9,5"
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "BZ23",
          "raw": 11
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "BZ24",
          "raw": 11
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "BZ25",
          "raw": "11,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "BZ26",
          "raw": "11,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "BZ27",
          "raw": 11
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "BZ28",
          "raw": 11
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "BZ29",
          "raw": 11
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "BZ30",
          "raw": 11
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "BZ31",
          "raw": 11
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "BZ32",
          "raw": 11
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "BZ33",
          "raw": 11
        }
      ],
      "excelSummary": [
        {
          "cell": "BZ69",
          "formula": "=IF(BZ17=\"\",\"\",MIN(BZ17:BZ67))",
          "cached": 11
        },
        {
          "cell": "BZ70",
          "formula": "=IF(BZ17=\"\",\"\",MAX(BZ17:BZ67))",
          "cached": 11
        },
        {
          "cell": "BZ71",
          "formula": "=IF(BZ17=\"\",\"\",AVERAGE(BZ17:BZ67))",
          "cached": 11
        },
        {
          "cell": "BZ72",
          "formula": "=IF(BZ17=\"\",\"\",STDEVP(BZ17:BZ67))",
          "cached": 0
        },
        {
          "cell": "BZ73",
          "formula": "=IF(BZ17=\"\",\"\",(BZ11-BZ10)/6/BZ72)",
          "cached": "#DIV/0!"
        },
        {
          "cell": "BZ74",
          "formula": "=IF(BZ17=\"\",\"\",MIN(((BZ11-BZ71)/3/BZ72),((BZ71-BZ10)/3/BZ72)))",
          "cached": "#DIV/0!"
        }
      ]
    },
    {
      "code": "MSA_CB",
      "column": "CB",
      "name": "Retardo disco corte",
      "unit": "seg",
      "limits": {
        "lower": 7,
        "upper": 9
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "CB17",
          "raw": 7
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "CB18",
          "raw": 7
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "CB19",
          "raw": 7
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "CB20",
          "raw": 7
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "CB21",
          "raw": 7
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "CB22",
          "raw": 7
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "CB23",
          "raw": 8
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "CB24",
          "raw": 8
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "CB25",
          "raw": "8,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "CB26",
          "raw": "8,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "CB27",
          "raw": 7
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "CB28",
          "raw": 7
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "CB29",
          "raw": 7
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "CB30",
          "raw": 7
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "CB31",
          "raw": 7
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "CB32",
          "raw": 7
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "CB33",
          "raw": 7
        }
      ],
      "excelSummary": [
        {
          "cell": "CB69",
          "formula": "=IF(CB17=\"\",\"\",MIN(CB17:CB67))",
          "cached": 7
        },
        {
          "cell": "CB70",
          "formula": "=IF(CB17=\"\",\"\",MAX(CB17:CB67))",
          "cached": 8
        },
        {
          "cell": "CB71",
          "formula": "=IF(CB17=\"\",\"\",AVERAGE(CB17:CB67))",
          "cached": 7.133333333333334
        },
        {
          "cell": "CB72",
          "formula": "=IF(CB17=\"\",\"\",STDEVP(CB17:CB67))",
          "cached": 0.33993463423951903
        },
        {
          "cell": "CB73",
          "formula": "=IF(CB17=\"\",\"\",(CB11-CB10)/6/CB72)",
          "cached": 0.98058067569092
        },
        {
          "cell": "CB74",
          "formula": "=IF(CB17=\"\",\"\",MIN(((CB11-CB71)/3/CB72),((CB71-CB10)/3/CB72)))",
          "cached": 0.1307440900921231
        }
      ]
    },
    {
      "code": "MSA_CD",
      "column": "CD",
      "name": "Retardo esteria saida",
      "unit": "seg",
      "limits": {
        "lower": 0.5,
        "upper": 1
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "CD17",
          "raw": "0,5"
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "CD18",
          "raw": "0,5"
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "CD19",
          "raw": "0,5"
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "CD20",
          "raw": "0,5"
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "CD21",
          "raw": "0,5"
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "CD22",
          "raw": "0,5"
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "CD23",
          "raw": "0,5"
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "CD24",
          "raw": "0,5"
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "CD25",
          "raw": "0,50"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "CD26",
          "raw": "0,50"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "CD27",
          "raw": 0.5
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "CD28",
          "raw": 0.5
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "CD29",
          "raw": 0.5
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "CD30",
          "raw": 0.5
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "CD31",
          "raw": 0.5
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "CD32",
          "raw": 0.5
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "CD33",
          "raw": 0.5
        }
      ],
      "excelSummary": [
        {
          "cell": "CD69",
          "formula": "=IF(CD17=\"\",\"\",MIN(CD17:CD67))",
          "cached": 0.5
        },
        {
          "cell": "CD70",
          "formula": "=IF(CD17=\"\",\"\",MAX(CD17:CD67))",
          "cached": 0.5
        },
        {
          "cell": "CD71",
          "formula": "=IF(CD17=\"\",\"\",AVERAGE(CD17:CD67))",
          "cached": 0.5
        },
        {
          "cell": "CD72",
          "formula": "=IF(CD17=\"\",\"\",STDEVP(CD17:CD67))",
          "cached": 0
        },
        {
          "cell": "CD73",
          "formula": "=IF(CD17=\"\",\"\",(CD11-CD10)/6/CD72)",
          "cached": "#DIV/0!"
        },
        {
          "cell": "CD74",
          "formula": "=IF(CD17=\"\",\"\",MIN(((CD11-CD71)/3/CD72),((CD71-CD10)/3/CD72)))",
          "cached": "#DIV/0!"
        }
      ]
    },
    {
      "code": "MSA_CF",
      "column": "CF",
      "name": "Pressão Ar",
      "unit": "bar",
      "limits": {
        "lower": "6,5",
        "upper": null
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "CF17",
          "raw": null
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "CF18",
          "raw": null
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "CF19",
          "raw": null
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "CF20",
          "raw": null
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "CF21",
          "raw": null
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "CF22",
          "raw": null
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "CF23",
          "raw": null
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "CF24",
          "raw": "6,6"
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "CF25",
          "raw": "6,6"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "CF26",
          "raw": "6,60"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "CF27",
          "raw": 6.6
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "CF28",
          "raw": 6.6
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "CF29",
          "raw": 6.6
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "CF30",
          "raw": 6.6
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "CF31",
          "raw": 6.8
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "CF32",
          "raw": 6.6
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "CF33",
          "raw": 6.6
        }
      ],
      "excelSummary": [
        {
          "cell": "CF69",
          "formula": "=IF(CF17=\"\",\"\",MIN(CF17:CF67))",
          "cached": null
        },
        {
          "cell": "CF70",
          "formula": "=IF(CF17=\"\",\"\",MAX(CF17:CF67))",
          "cached": null
        },
        {
          "cell": "CF71",
          "formula": "=IF(CF17=\"\",\"\",AVERAGE(CF17:CF67))",
          "cached": null
        },
        {
          "cell": "CF72",
          "formula": "=IF(CF17=\"\",\"\",STDEVP(CF17:CF67))",
          "cached": null
        },
        {
          "cell": "CF73",
          "formula": "=IF(CF17=\"\",\"\",(CF11-CF10)/6/CF72)",
          "cached": null
        },
        {
          "cell": "CF74",
          "formula": "=IF(CF17=\"\",\"\",MIN(((CF11-CF71)/3/CF72),((CF71-CF10)/3/CF72)))",
          "cached": null
        }
      ]
    },
    {
      "code": "MSA_CH",
      "column": "CH",
      "name": "Vacuo",
      "unit": "mm/Hg",
      "limits": {
        "lower": -600,
        "upper": null
      },
      "samples": [
        {
          "row": 17,
          "date": "2026-08-25",
          "cell": "CH17",
          "raw": null
        },
        {
          "row": 18,
          "date": "2026-08-25",
          "cell": "CH18",
          "raw": null
        },
        {
          "row": 19,
          "date": "2026-08-26",
          "cell": "CH19",
          "raw": null
        },
        {
          "row": 20,
          "date": "2026-08-26",
          "cell": "CH20",
          "raw": null
        },
        {
          "row": 21,
          "date": "2026-08-27",
          "cell": "CH21",
          "raw": null
        },
        {
          "row": 22,
          "date": "2026-08-27",
          "cell": "CH22",
          "raw": null
        },
        {
          "row": 23,
          "date": "2026-08-28",
          "cell": "CH23",
          "raw": null
        },
        {
          "row": 24,
          "date": "2026-08-28",
          "cell": "CH24",
          "raw": -600
        },
        {
          "row": 25,
          "date": "31/08/2026",
          "cell": "CH25",
          "raw": "-300,00"
        },
        {
          "row": 26,
          "date": "31/08/2026",
          "cell": "CH26",
          "raw": "-340,00"
        },
        {
          "row": 27,
          "date": "2026-09-17",
          "cell": "CH27",
          "raw": -540
        },
        {
          "row": 28,
          "date": "2026-09-21",
          "cell": "CH28",
          "raw": -560
        },
        {
          "row": 29,
          "date": "2026-09-22",
          "cell": "CH29",
          "raw": -540
        },
        {
          "row": 30,
          "date": "2026-09-23",
          "cell": "CH30",
          "raw": -540
        },
        {
          "row": 31,
          "date": "2026-09-24",
          "cell": "CH31",
          "raw": -550
        },
        {
          "row": 32,
          "date": "2026-09-25",
          "cell": "CH32",
          "raw": -570
        },
        {
          "row": 33,
          "date": "2026-09-29",
          "cell": "CH33",
          "raw": -550
        }
      ],
      "excelSummary": [
        {
          "cell": "CH69",
          "formula": "=IF(CH17=\"\",\"\",MIN(CH17:CH67))",
          "cached": null
        },
        {
          "cell": "CH70",
          "formula": "=IF(CH17=\"\",\"\",MAX(CH17:CH67))",
          "cached": null
        },
        {
          "cell": "CH71",
          "formula": "=IF(CH17=\"\",\"\",AVERAGE(CH17:CH67))",
          "cached": null
        },
        {
          "cell": "CH72",
          "formula": "=IF(CH17=\"\",\"\",STDEVP(CH17:CH67))",
          "cached": null
        },
        {
          "cell": "CH73",
          "formula": "=IF(CH17=\"\",\"\",(CH11-CH10)/6/CH72)",
          "cached": null
        },
        {
          "cell": "CH74",
          "formula": "=IF(CH17=\"\",\"\",MIN(((CH11-CH71)/3/CH72),((CH71-CH10)/3/CH72)))",
          "cached": null
        }
      ]
    }
  ]
};
