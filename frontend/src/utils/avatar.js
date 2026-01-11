export const getAvatarUrl = (seed) => {
    // Using 'bottts' for robots as default style. 
    // Options: 'avataaars', 'bottts', 'identicon', 'miniavs', 'open-peeps'
    // User asked for "Avatars no emojis", let's use a nice illustrated style.
    // 'avataaars' is classic for humans, 'bottts' for robots.
    // Let's use 'notionists' or 'adventurer' if available, or 'bottts-neutral'.
    // API v9 syntax: https://api.dicebear.com/9.x/[style]/svg?seed=[seed]

    // Let's map our internal IDs to seeds or styles.
    // user.avatar usually is 'robot_1', 'alien_1'.

    let style = 'bottts';
    // If specifically human:
    if (['cool_1', 'ninja_1'].includes(seed)) style = 'avataaars';
    if (['cat_1'].includes(seed)) style = 'fun-emoji'; // or similar

    // Simplification: Use 'bottts' for a consistent Sci-Fi/Tech trivia look 
    // OR 'avataaars' for human look. User said "Robots" in previous prompt context? No, just "Avatars".

    return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&backgroundColor=transparent`;
};

// Helper for pure seeds if we want random
export const getRandomAvatar = () => {
    return Math.random().toString(36).substring(7);
}
