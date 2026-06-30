// background.js — 后台服务工作进程
// 处理右键菜单和快捷键

// 右键上下文菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "han-yan-search",
    title: "📜 汉语言查询：「%s」",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "han-yan-shuowen",
    title: "🔍 查说文解字",
    parentId: "han-yan-search",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "han-yan-pingze",
    title: "📐 测平仄",
    parentId: "han-yan-search",
    contexts: ["selection"]
  });
  
  chrome.contextMenus.create({
    id: "han-yan-jingdian",
    title: "🏛 查经学引证",
    parentId: "han-yan-search",
    contexts: ["selection"]
  });
});

// 右键菜单点击处理
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.selectionText) return;
  const text = info.selectionText.trim().slice(0, 50);
  
  let query = text;
  
  if (info.menuItemId === "han-yan-shuowen") {
    query = `说文 ${text}`;
  } else if (info.menuItemId === "han-yan-pingze") {
    query = `平仄 ${text}`;
  } else if (info.menuItemId === "han-yan-jingdian") {
    query = `经典 ${text}`;
  }
  
  chrome.action.openPopup();
  
  // 通过 storage 传递查询内容
  chrome.storage.local.set({ selection: text, tool: info.menuItemId });
});

// 快捷键
chrome.commands.onCommand.addListener((command) => {
  if (command === "open-popup") {
    chrome.action.openPopup();
  }
});
