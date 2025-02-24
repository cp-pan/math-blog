// ======================
// 1. 监听评论加载完成事件
// ======================
document.addEventListener('utterances:ready', () => {
  addDeleteButtonsToComments();
});

// 如果事件监听失败，每隔1秒检查一次
setInterval(addDeleteButtonsToComments, 1000);

// ======================
// 2. 为每条评论添加删除按钮
// ======================
function addDeleteButtonsToComments() {
  // 选择所有评论元素（Utterances 的评论类名为 .timeline-comment）
  const comments = document.querySelectorAll('.timeline-comment');

  comments.forEach((comment) => {
    // 如果已经添加过按钮，跳过
    if (comment.querySelector('.delete-btn')) return;

    // 获取评论 ID 和作者
    const commentId = comment.getAttribute('data-comment-id');
    const author = comment.querySelector('.author').textContent;

    // 创建删除按钮
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '删除';
    deleteBtn.onclick = () => handleDeleteComment(commentId, author);

    // 将按钮插入评论头部
    const commentHeader = comment.querySelector('.timeline-comment-header');
    commentHeader.appendChild(deleteBtn);

    // 存储元数据到评论容器
    comment.setAttribute('data-comment-id', commentId);
    comment.setAttribute('data-author', author);
  });
}

// ======================
// 3. 处理删除操作
// ======================
async function handleDeleteComment(commentId, author) {
  // 检查用户是否登录
  const user = localStorage.getItem('github_user');
  const token = localStorage.getItem('github_token');

  if (!user || !token) {
    // 跳转到 GitHub 登录
    const clientId = 'Ov23liLLGiVy6pYRp1LK'; // 替换为你的 Client ID
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(window.location.href)}`;
    return;
  }

  // 验证权限（用户是作者或管理员）
  if (user !== author && !(await checkRepoAdmin(user, token))) {
    alert('您无权删除此评论！');
    return;
  }

  // 调用 GitHub API 删除评论
  try {
    const response = await fetch(`https://api.github.com/repos/your-github-username/your-repo-name/issues/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `token ${token}` },
    });

    if (response.status === 204) {
      // 删除成功，移除页面中的评论
      document.querySelector(`[data-comment-id="${commentId}"]`).remove();
    } else {
      alert('删除失败！');
    }
  } catch (error) {
    console.error('删除错误:', error);
  }
}

// ======================
// 4. 检查用户是否为仓库管理员
// ======================
async function checkRepoAdmin(user, token) {
  try {
    const response = await fetch('https://api.github.com/repos/your-github-username/your-repo-name/collaborators', {
      headers: { Authorization: `token ${token}` },
    });
    const collaborators = await response.json();
    const userRole = collaborators.find(c => c.login === user)?.role;
    return userRole === 'admin';
  } catch (error) {
    return false;
  }
}
