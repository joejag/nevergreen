import React, {ReactElement, useState} from 'react'
import cn from 'classnames'
import styles from './header.scss'
import logo from './buildcanaries-logo.png'
import {NavLink} from 'react-router-dom'
import {Shortcut} from '../common/Shortcut'
import Mousetrap from 'mousetrap'
import {SHOW_HELP_SHORTCUT} from '../help/Help'

interface HeaderProps {
  readonly fullScreen: boolean;
}

const MENU_ITEMS = [
  {id: 'monitor', title: 'Monitor', shortcuts: ['m', '1']},
  {id: 'tracking', title: 'Tracking', shortcuts: ['t', '2']},
  {id: 'success', title: 'Success', shortcuts: ['s', '3']},
  {id: 'settings', title: 'Settings', shortcuts: [',', '4']},
  {id: 'backup', title: 'Backup', shortcuts: ['b', '5']}
]

export function Header({fullScreen}: HeaderProps): ReactElement {
  const [menuVisible, setMenuVisible] = useState(false)

  const headerClassNames = cn(styles.siteHeader, {
    [styles.fullscreen]: fullScreen
  })
  const menuClassNames = cn(styles.menu, {
    [styles.open]: menuVisible
  })
  const iconClassNames = cn({
    [styles.siteMenuShow]: !menuVisible,
    [styles.siteMenuHide]: menuVisible
  })
  const toggleLabel = menuVisible ? 'hide menu' : 'show menu'

  return (
    <header className={headerClassNames}>
      <img src={logo} className={styles.logo} alt='Nevergreen' aria-hidden/>
      <nav className={styles.siteMenu}>
        <button className={styles.siteMenuToggle}
                onClick={() => setMenuVisible(!menuVisible)}
                aria-label={toggleLabel}
                aria-expanded={menuVisible}
                type='button'>
          <span className={iconClassNames} aria-hidden/>
        </button>
        <ul className={menuClassNames}>
          {
            MENU_ITEMS.map((item) => {
              const iconClasses = cn(styles.menuIcon, styles[item.id])

              return (
                <li key={item.id}>
                  <NavLink to={`/${item.id}`}
                           className={styles.menuItem}
                           activeClassName={styles.active}
                           onClick={() => setMenuVisible(false)}
                           data-locator={`menu-${item.id}`}>
                    <span className={iconClasses} aria-hidden/>
                    <div className={styles.menuTitle}>{item.title}</div>
                    <Shortcut hotkeys={item.shortcuts}/>
                  </NavLink>
                </li>
              )
            })
          }
          <li>
            <button className={styles.helpButton}
                    onClick={() => {
                      Mousetrap.trigger(SHOW_HELP_SHORTCUT)
                      setMenuVisible(false)
                    }}>
              <span className={cn(styles.menuIcon, styles.help)} aria-hidden/>
              <div className={styles.menuTitle}>Help</div>
            </button>
          </li>
        </ul>
      </nav>
    </header>
  )
}
