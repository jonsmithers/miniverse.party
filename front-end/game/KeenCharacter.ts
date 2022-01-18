import * as PIXI from 'pixi.js'

const KeenAnimationNames = {
  runRight: 'run right ',
  runLeft: 'run left ',
  jumpRight: 'jump right ',
} as const;
const KeenStaticNames = {
  standLeft: 'stand left.png',
  standRight: 'standing.png',
} as const;
export const KeenStates = Object.assign({}, KeenAnimationNames, KeenStaticNames);
const KeenAnimationNamesArray = Object.values(KeenAnimationNames);
type KeenAnimationName = typeof KeenAnimationNamesArray[number];
const isKeenAnimationName = (s: string): s is KeenAnimationName => KeenAnimationNamesArray.includes(s as any);
const KeenStaticNamesArray = Object.values(KeenStaticNames);
type KeenStaticName = typeof KeenStaticNamesArray[number];

interface KeenSpriteHolder {
  animationSprites: {
    [index in KeenAnimationName]: PIXI.AnimatedSprite;
  };
  staticSprites: {
    [index in KeenStaticName]: PIXI.Sprite;
  };
}
export class KeenCharacter extends PIXI.Container implements KeenSpriteHolder {
  animationSprites: KeenSpriteHolder['animationSprites'];
  staticSprites: KeenSpriteHolder['staticSprites'];
  constructor(loader: PIXI.Loader) {
    super();
    const keenSpritesheet = loader.resources.keen.spritesheet
    this.animationSprites = {
      [KeenAnimationNames.runRight]: new PIXI.AnimatedSprite(keenSpritesheet!.animations[KeenAnimationNames.runRight]),
      [KeenAnimationNames.runLeft]: new PIXI.AnimatedSprite(keenSpritesheet!.animations[KeenAnimationNames.runLeft]),
      [KeenAnimationNames.jumpRight]: new PIXI.AnimatedSprite(keenSpritesheet!.animations[KeenAnimationNames.jumpRight]),
    }
    this.staticSprites = {
      [KeenStaticNames.standLeft]: new PIXI.Sprite(keenSpritesheet!.textures[KeenStaticNames.standLeft]),
      [KeenStaticNames.standRight]: new PIXI.Sprite(keenSpritesheet!.textures[KeenStaticNames.standRight]),
    };
    Object.values(this.animationSprites).forEach(sprite => {
      sprite.scale.set(2);
      sprite.animationSpeed = 0.08;
    });
    Object.values(this.staticSprites).forEach(sprite => {
      sprite.scale.set(2);
    });
    this.state = KeenStaticNames.standRight;
  }
  set state(newState: KeenAnimationName | KeenStaticName) {
    this.removeChildren();
    if (isKeenAnimationName(newState)) {
      this.addChild(this.animationSprites[newState]);
      this.animationSprites[newState].play();
    } else {
      this.addChild(this.staticSprites[newState]);
    }
  }
}
