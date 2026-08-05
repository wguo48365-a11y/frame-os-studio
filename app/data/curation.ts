export type CuratedFrame = {
  id: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  mood: string;
  image: string;
  sourceUrl: string;
  author: string;
  license: string;
  licenseUrl: string;
};

export const curationDate = "2026-08-05";

export const curatedFrames: CuratedFrame[] = [
  {
    id: "2026-08-05-01",
    title: "粗野主义地平线",
    date: curationDate,
    category: "建筑",
    tags: ["粗野主义", "黑白", "低机位"],
    mood: "冷峻 / 压迫",
    image: "/curation/2026-08-05/brutalist-horizon.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Brutalist_Architecture_(51399696479).jpg",
    author: "Steven Penton",
    license: "CC BY 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by/2.0",
  },
  {
    id: "2026-08-05-02",
    title: "窗光切面",
    date: curationDate,
    category: "人物",
    tags: ["侧窗光", "高反差", "负空间"],
    mood: "私密 / 克制",
    image: "/curation/2026-08-05/window-contrast.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Window_light_portrait_using_a_small_window_that_raises_the_contrast_-_taken_in_the_Streckenw%C3%A4rterhaus_in_the_market_town_of_Feucht.jpg",
    author: "Tobias ToMar Maier",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    id: "2026-08-05-03",
    title: "蓝线舞台",
    date: curationDate,
    category: "舞台",
    tags: ["群像", "顶光", "舞台边界"],
    mood: "秩序 / 疏离",
    image: "/curation/2026-08-05/blue-stage.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:%22Khanom%22_theater_in_Qom-Stage_lighting-2016-_Mustafa_Meraji_25.jpg",
    author: "Mostafameraji",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  {
    id: "2026-08-05-04",
    title: "暗部排演",
    date: curationDate,
    category: "光影",
    tags: ["低调照明", "前后景", "局部面光"],
    mood: "悬念 / 凝视",
    image: "/curation/2026-08-05/shadow-rehearsal.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:%22Khanom%22_theater_in_Qom-Stage_lighting-2016-_Mustafa_Meraji_10.jpg",
    author: "Mostafameraji",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  },
  {
    id: "2026-08-05-05",
    title: "雾中轴线",
    date: curationDate,
    category: "氛围",
    tags: ["极简", "消失点", "黑白"],
    mood: "静止 / 未知",
    image: "/curation/2026-08-05/fog-axis.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Leuste,_B%C3%A4ume_im_Nebel_--_2020_--_5042_(bw).jpg",
    author: "Dietmar Rabich",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    id: "2026-08-05-06",
    title: "晨雾余温",
    date: curationDate,
    category: "氛围",
    tags: ["逆光", "空气透视", "暖金"],
    mood: "苏醒 / 松弛",
    image: "/curation/2026-08-05/golden-ditch.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Umland,_Sonnenaufgang_--_2012_--_8084.jpg",
    author: "Dietmar Rabich",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    id: "2026-08-05-07",
    title: "折射色谱",
    date: curationDate,
    category: "色彩",
    tags: ["抽象", "条纹玻璃", "色彩采样"],
    mood: "流动 / 实验",
    image: "/curation/2026-08-05/fluted-color.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Ornamentglas_B_-_Ansicht_1.jpg",
    author: "Roman Eisele",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
  {
    id: "2026-08-05-08",
    title: "白色缎带",
    date: curationDate,
    category: "建筑",
    tags: ["现代主义", "几何", "暖窗"],
    mood: "理性 / 余温",
    image: "/curation/2026-08-05/white-ribbon.jpg",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:M%C3%BCnster,_LBS_--_2021_--_9803.jpg",
    author: "Dietmar Rabich",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
  },
];
