<?php

		function is_weixin()
		{
		    if (strpos($_SERVER['HTTP_USER_AGENT'], 'MicroMessenger') !== false) {
		        return true;
		    }
		    return false;
		}
		
    try {
        $authcode = $_GET['authcode'];
        $id = $_GET['id'];
        if(is_weixin()){
        	 $url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx3088ce836b07014c&redirect_uri=http://webauth9527.stxqh.cn/redirect.php?authcode='.$authcode.'%26id='.$id.'&response_type=code&scope=snsapi_userinfo';
        	echo "<SCRIPT LANGUAGE=\"JavaScript\">location.href='$url'</SCRIPT>";
        }else{
            echo "请使用微信扫码";
        }
       
    } catch (Exception $e) {
        echo $e->getMessage();
        // die(); // 终止异常
    }
