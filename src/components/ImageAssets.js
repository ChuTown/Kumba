// Button image paths
const buttonImages = {
    mint: {
        big: {
            idle: '/src/assets/images/buttons/button_mint_big_idle.png',
            hover: '/src/assets/images/buttons/button_mint_big_hover.png',
            clicked: '/src/assets/images/buttons/button_mint_big_clicked.png'
        },
        up: {
            idle: '/src/assets/images/buttons/button_mint_up_idle.png',
            hover: '/src/assets/images/buttons/button_mint_up_hover.png',
            clicked: '/src/assets/images/buttons/button_mint_up_clicked.png'
        },
        down: {
            idle: '/src/assets/images/buttons/button_mint_down_idle.png',
            hover: '/src/assets/images/buttons/button_mint_down_hover.png',
            clicked: '/src/assets/images/buttons/button_mint_down_clicked.png'
        }
    },
    twitter: {
        idle: '/src/assets/images/buttons/button_twitter_idle.png',
        hover: '/src/assets/images/buttons/button_twitter_hover.png',
        clicked: '/src/assets/images/buttons/button_twitter_clicked.png'
    },
    wallet: {
        idle: '/src/assets/images/buttons/button_wallet_idle.png',
        hover: '/src/assets/images/buttons/button_wallet_hover.png',
        clicked: '/src/assets/images/buttons/button_wallet_clicked.png'
    }
};

// Home page images
const homeImages = {
    background: '/src/assets/images/home/home_bg.png',
    raft: '/src/assets/images/home/raft.png',
    rope: '/src/assets/images/home/rope.png'
};

// Mint page images
const mintImages = {
    background: '/src/assets/images/mint/mint_bg.png',
    animatedFire: '/src/assets/images/mint/mint_page_animated_fire.gif',
    timeline: [
        '/src/assets/images/mint/timeline 1_0001.png',
        '/src/assets/images/mint/timeline 1_0002.png',
        '/src/assets/images/mint/timeline 1_0003.png',
        '/src/assets/images/mint/timeline 1_0004.png',
        '/src/assets/images/mint/timeline 1_0005.png',
        '/src/assets/images/mint/timeline 1_0006.png'
    ]
};

// Preload all images
export function preloadImages() {
    const allImages = [
        ...Object.values(buttonImages.mint.big),
        ...Object.values(buttonImages.mint.up),
        ...Object.values(buttonImages.mint.down),
        ...Object.values(buttonImages.twitter),
        ...Object.values(buttonImages.wallet),
        ...Object.values(homeImages),
        mintImages.background,
        mintImages.animatedFire,
        ...mintImages.timeline
    ];

    allImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

export { buttonImages, homeImages, mintImages }; 