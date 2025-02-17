import { useHydrated } from '@tonic-ui/react-hooks';
import { canUseDOM, runIfFn } from '@tonic-ui/utils';
import { ensureArray, ensureString } from 'ensure-type';
import memoize from 'micro-memoize';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { isElement, isValidElementType } from 'react-is';
import {
  TransitionGroup,
} from 'react-transition-group';
import ToastContainer from './ToastContainer';
import ToastController from './ToastController';
import ToastTransition from './ToastTransition';
import { ToastManagerContext } from './context';

const uniqueId = (() => {
  let id = 0;
  return () => {
    id += 1;
    return String(id);
  };
})();

const getMemoizedState = memoize(state => ({ ...state }));

const defaultPlacement = 'bottom-right';
const placements = [
  'bottom',
  'bottom-right',
  'bottom-left',
  'top',
  'top-left',
  'top-right',
];

const getToastPlacementByState = (state, id) => {
  const toast = Object.values(state)
    .reduce((acc, val) => acc.concat(val), [])
    .find((toast) => toast.id === id);
  return toast?.placement;
};

const ToastManager = ({
  children,
  container, // deprecated (remove in next major version)
  //containerRef: containerRefProp,
  placement: placementProp = defaultPlacement,
}) => {
  const isHydrated = useHydrated();
  const [state, setState] = useState(() => (
    placements.reduce((acc, placement) => {
      acc[placement] = [];
      return acc;
    }, {})
  ));

  /**
   * Create properties for a new toast
   */
  const createToast = (message, options) => {
    const id = options?.id ?? uniqueId();
    const placement = ensureString(options?.placement ?? placementProp);
    const duration = options?.duration;
    const onClose = () => close(id, placement);

    return {
      // A unique identifier that represents the toast message
      id,

      // The toast message to render
      message,

      // The placement of the toast
      placement,

      // The duration (in milliseconds) that the toast should remain on the screen. If set to null, toast will never dismiss.
      duration,

      // The function to close the toast
      onClose,
    };
  };

  /**
   * Close a toast record at its placement
   */
  const close = (id, placement) => {
    placement = placement ?? getToastPlacementByState(state, id);

    setState((prevState) => ({
      ...prevState,
      [placement]: ensureArray(prevState[placement]).filter((toast) => toast.id !== id),
    }));
  };

  /**
   * Close all toasts at once with the given placements, including the following:
   * • top
   * • top-left
   * • top-right
   * • bottom
   * • bottom-left
   * • bottom-right
   */
  const closeAll = (options) => {
    const placements = options?.placements
      ? ensureArray(options?.placements)
      : Object.keys(state);

    setState((prevState) => {
      const nextState = placements.reduce((acc, placement) => {
        acc[placement] = [];
        return acc;
      }, {});

      return {
        ...prevState,
        ...nextState,
      };
    });
  };

  /**
   * Find the first toast in the array that matches the provided id. Otherwise, `undefined` is returned if not found.
   * If no values satisfy the testing function, undefined is returned.
   */
  const find = (id) => {
    const placement = getToastPlacementByState(state, id);
    return ensureArray(state[placement]).find((toast) => toast.id === id);
  };

  /**
   * Find the first toast in the array that matches the provided id. Otherwise, -1 is returned if not found.
   */
  const findIndex = (id) => {
    const placement = getToastPlacementByState(state, id);
    return ensureArray(state[placement]).findIndex((toast) => toast.id === id);
  };

  /**
   * Create a toast at the specified placement and return the id
   */
  const notify = (message, options) => {
    const toast = createToast(message, options);
    const { placement, id } = toast;

    setState((prevState) => {
      const isTop = placement.includes('top');

      /**
       * For the toast is placemented at the top edges:
       *   toast #3 ← the most recent
       *   toast #2
       *   toast #1
       *
       * For the toast is placemented at the bottom edges:
       *   toast #1
       *   toast #2
       *   toast #3 ← the most recent
       */
      const prevToasts = ensureArray(prevState[placement]);
      const toasts = isTop
        ? [toast, ...prevToasts]
        : [...prevToasts, toast];

      return {
        ...prevState,
        [placement]: toasts,
      };
    });

    return id;
  };

  /**
   * Update a specific toast with new options based on the given id. Returns `true` if the toast exists, else `false`.
   */
  const update = (id, options) => {
    const placement = find(id)?.placement;
    const index = findIndex(id);

    if (!placement || index === -1) {
      return false;
    }

    setState((prevState) => {
      const nextState = { ...prevState };
      nextState[placement][index] = {
        ...nextState[placement][index],
        ...options,
      };
      return nextState;
    });

    return true;
  };

  const context = getMemoizedState({
    // Methods
    close,
    closeAll,
    find,
    findIndex,
    notify,
    update,

    // Properties
    placement: placementProp,

    // State
    state,
  });

  const portalTarget = canUseDOM()
    ? (container ?? document.body)
    : null;

  if (!portalTarget) {
    return (
      <ToastManagerContext.Provider value={context}>
        {runIfFn(children, context)}
      </ToastManagerContext.Provider>
    );
  }

  return (
    <ToastManagerContext.Provider value={context}>
      {runIfFn(children, context)}
      {isHydrated && createPortal((
        Object.keys(state).map((placement) => {
          const toasts = ensureArray(state[placement]);
          return (
            <ToastContainer
              key={placement}
              placement={placement}
            >
              <TransitionGroup component={null}>
                {toasts.map((toast) => (
                  <ToastTransition
                    key={toast.id}
                    in={true}
                    collapsedHeight={0}
                    unmountOnExit
                  >
                    <ToastController
                      duration={toast.duration}
                      onClose={toast.onClose}
                    >
                      {(() => {
                        if (isElement(toast.message)) {
                          return toast.message;
                        }
                        if (isValidElementType(toast.message)) {
                          return (
                            <toast.message
                              id={toast.id}
                              onClose={toast.onClose}
                              placement={toast.placement}
                            />
                          );
                        }
                        return null;
                      })()}
                    </ToastController>
                  </ToastTransition>
                ))}
              </TransitionGroup>
            </ToastContainer>
          );
        })
      ), portalTarget)}
    </ToastManagerContext.Provider>
  );
};

ToastManager.displayName = 'ToastManager';

export default ToastManager;
