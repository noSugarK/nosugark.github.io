/* demo-lab 与 motion-lab 共用的「示例 / 代码」Tab。
   create(tag, className, text) 由调用方传入，按钮状态与键盘切换在这里统一处理；
   onSelect(index) 只负责切换面板内容，避免两个文件各写一份。 */
export function makeDemoTabs(create, onSelect, labels = ['示例', '代码']) {
  const tabs = create('div', 'demo-tabs');
  tabs.setAttribute('role', 'tablist');
  const buttons = labels.map((label, index) => {
    const tab = create('button', 'demo-tab', label);
    tab.type = 'button';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', String(index === 0));
    tab.tabIndex = index === 0 ? 0 : -1;
    return tab;
  });
  tabs.append(...buttons);

  const select = index => {
    buttons.forEach((tab, position) => {
      const active = position === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    onSelect(index);
  };
  buttons.forEach((tab, index) => tab.addEventListener('click', () => select(index)));
  tabs.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const current = buttons.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
    const next = (current + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus();
    buttons[next].click();
  });

  return {tabs, select};
}
