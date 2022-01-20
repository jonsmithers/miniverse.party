import { AnimatedSprite, Container, useTick } from '@inlet/react-pixi';
import * as PIXI from 'pixi.js'
import { useEffect, useMemo, useState } from 'react';
import { useGameContext } from './GameContext';

const CharacterStates = ['runRight'] as const;
type CharacterState = typeof CharacterStates[number];

interface InternalState<T> {
  speculatedValue: T;
  baseValue: T;
  baseTimestamp: number;
}
/**
 * @return - speculated value
 */
function useSpeculation<T>(baseValue: T, speculate: (baseValue: T, millisElapsed: number) => T): T {
  const [state, setState] = useState<InternalState<T>>(() => ({ speculatedValue: baseValue, baseValue, baseTimestamp: performance.now() }));

  useEffect(() => {
    setState({
      speculatedValue: baseValue,
      baseValue,
      baseTimestamp: performance.now(),
    });
  }, [baseValue]);

  useTick(() => {
    setState(old => ({
      ...old,
      speculatedValue: speculate(old.baseValue, performance.now() - old.baseTimestamp),
    }));
  });

  return state.speculatedValue;
}

export const KeenCharacter: React.FC<{ characterIndex: number, characterState: CharacterState }> = (props) => {
  const gameContext = useGameContext();
  const { loader } = gameContext;
  const { x, y } = gameContext.stage.characters[props.characterIndex];
  const position: [number, number] = useMemo(() => [x,y], [x,y]);
  const speculatedPosition = useSpeculation(position, ([x,y], elapsed) => [x + elapsed/10, y] as [number, number]);

  const keenSpritesheet = useMemo(() => loader === 'still loading' ? undefined : loader.resources.keen.spritesheet, [loader]);
  const spriteMap: undefined | {
    [i in typeof CharacterStates[number]]: PIXI.Texture<PIXI.Resource>[]
  } = useMemo(() => keenSpritesheet && ({
    runRight: keenSpritesheet.animations['run right '],
  }), [keenSpritesheet]);

  const textures = useMemo(() => spriteMap?.[props.characterState], [props.characterState, spriteMap])

  return (
    <Container position={speculatedPosition}>
      {textures && <AnimatedSprite
        textures={textures}
        isPlaying={true}
        scale={2}
        animationSpeed={0.1}
      />}
    </Container>
  );
}











// NEW IDEA
// const States = ['runRightOrSomething', 'standRightOrSomething'] as const
// const NewIdeaForThis = {
//   runRightOrSomething: GenericSprite.animate('name')
//   standRightOrSomething: GenericSprice.static('other name')
// }

  /*
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
  */
