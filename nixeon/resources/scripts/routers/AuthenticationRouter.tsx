import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import styled from 'styled-components/macro';
import LoginContainer from '@/components/auth/LoginContainer';
import ForgotPasswordContainer from '@/components/auth/ForgotPasswordContainer';
import ResetPasswordContainer from '@/components/auth/ResetPasswordContainer';
import LoginCheckpointContainer from '@/components/auth/LoginCheckpointContainer';
import { NotFound } from '@/components/elements/ScreenBlock';
import ThemeToggle from '@/components/elements/ThemeToggle';
import { useHistory, useLocation } from 'react-router';

/**
 * Auth shell.
 *
 * Mobile-first: the card is centred in a single column and the page uses `100dvh`
 * (dynamic viewport height) so mobile browser chrome collapsing does not push the
 * form off-screen. On desktop the same centred column simply gains breathing room —
 * there is no separate desktop-only layout to keep in sync.
 *
 * The theme switch is fixed to the corner rather than inside the card so it is
 * reachable on the login screen too (a user should be able to pick their theme
 * before they have an account session).
 */
const Shell = styled.div`
    position: relative;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4.5rem 0 3rem;
    background: var(--nx-base);

    /* a very soft radial lift behind the card, like light falling on a bench */
    &::before {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        background: radial-gradient(
            120% 80% at 50% 0%,
            color-mix(in srgb, var(--nx-light) 60%, transparent) 0%,
            transparent 60%
        );
    }
`;

const Corner = styled.div`
    position: fixed;
    top: 0.9rem;
    /* align with the card gutter (1rem) rather than hugging the viewport edge, so
       the control does not sit under a curved bezel or a gesture bar */
    right: 1rem;
    z-index: 20;

    @media (min-width: 640px) {
        top: 1.25rem;
        right: 1.25rem;
    }
`;

export default () => {
    const history = useHistory();
    const location = useLocation();
    const { path } = useRouteMatch();

    return (
        <Shell>
            <Corner>
                <ThemeToggle />
            </Corner>

            <Switch location={location}>
                <Route path={`${path}/login`} component={LoginContainer} exact />
                <Route path={`${path}/login/checkpoint`} component={LoginCheckpointContainer} />
                <Route path={`${path}/password`} component={ForgotPasswordContainer} exact />
                <Route path={`${path}/password/reset/:token`} component={ResetPasswordContainer} />
                <Route path={`${path}/checkpoint`} />
                <Route path={'*'}>
                    <NotFound onBack={() => history.push('/auth/login')} />
                </Route>
            </Switch>
        </Shell>
    );
};
