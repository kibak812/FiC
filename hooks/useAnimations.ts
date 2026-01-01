import { useState, useCallback } from 'react';

/**
 * Animation state for visual effects
 */
export interface AnimationState {
  shake: boolean;
  shieldEffect: boolean;
  playerHit: boolean;
  enemyPoisoned: boolean;
  enemyBurning: boolean;
  enemyBleeding: boolean;
  playerHealing: boolean;
  playerBlocking: boolean;
  enemyAttacking: boolean;
}

/**
 * Animation trigger functions
 */
export interface AnimationTriggers {
  triggerShake: () => void;
  triggerShieldEffect: () => void;
  triggerPlayerHit: () => void;
  triggerEnemyPoison: () => void;
  triggerEnemyBurn: () => void;
  triggerEnemyBleed: () => void;
  triggerPlayerHeal: () => void;
  triggerPlayerBlock: () => void;
  triggerEnemyAttack: () => void;
}

const INITIAL_STATE: AnimationState = {
  shake: false,
  shieldEffect: false,
  playerHit: false,
  enemyPoisoned: false,
  enemyBurning: false,
  enemyBleeding: false,
  playerHealing: false,
  playerBlocking: false,
  enemyAttacking: false,
};

/**
 * Hook to manage all visual animation states
 * Consolidates 9 separate useState + trigger functions into one hook
 */
export const useAnimations = (): [AnimationState, AnimationTriggers] => {
  const [shake, setShake] = useState(false);
  const [shieldEffect, setShieldEffect] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [enemyPoisoned, setEnemyPoisoned] = useState(false);
  const [enemyBurning, setEnemyBurning] = useState(false);
  const [enemyBleeding, setEnemyBleeding] = useState(false);
  const [playerHealing, setPlayerHealing] = useState(false);
  const [playerBlocking, setPlayerBlocking] = useState(false);
  const [enemyAttacking, setEnemyAttacking] = useState(false);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const triggerShieldEffect = useCallback(() => {
    setShieldEffect(true);
    setTimeout(() => setShieldEffect(false), 600);
  }, []);

  const triggerPlayerHit = useCallback(() => {
    setPlayerHit(true);
    setTimeout(() => setPlayerHit(false), 400);
  }, []);

  const triggerEnemyPoison = useCallback(() => {
    setEnemyPoisoned(true);
    setTimeout(() => setEnemyPoisoned(false), 600);
  }, []);

  const triggerEnemyBurn = useCallback(() => {
    setEnemyBurning(true);
    setTimeout(() => setEnemyBurning(false), 500);
  }, []);

  const triggerEnemyBleed = useCallback(() => {
    setEnemyBleeding(true);
    setTimeout(() => setEnemyBleeding(false), 500);
  }, []);

  const triggerPlayerHeal = useCallback(() => {
    setPlayerHealing(true);
    setTimeout(() => setPlayerHealing(false), 600);
  }, []);

  const triggerPlayerBlock = useCallback(() => {
    setPlayerBlocking(true);
    setTimeout(() => setPlayerBlocking(false), 400);
  }, []);

  const triggerEnemyAttack = useCallback(() => {
    setEnemyAttacking(true);
    setTimeout(() => setEnemyAttacking(false), 400);
  }, []);

  const state: AnimationState = {
    shake,
    shieldEffect,
    playerHit,
    enemyPoisoned,
    enemyBurning,
    enemyBleeding,
    playerHealing,
    playerBlocking,
    enemyAttacking,
  };

  const triggers: AnimationTriggers = {
    triggerShake,
    triggerShieldEffect,
    triggerPlayerHit,
    triggerEnemyPoison,
    triggerEnemyBurn,
    triggerEnemyBleed,
    triggerPlayerHeal,
    triggerPlayerBlock,
    triggerEnemyAttack,
  };

  return [state, triggers];
};
