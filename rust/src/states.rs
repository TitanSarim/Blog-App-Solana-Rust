use anchor_lang::prelude::*;

#[account]
#[derive(Default)]

pub struct UserAccount {
    pub name: String,
    pub avatar: String,
    pub authority: Pubkey,
    pub last_post_id: u8,
    pub post_count: u8,
}

#[account]
#[derive(Default)]
pub struct PostAccount {
    pub id: u8,
    pub title: String,
    pub content: String,
    pub user: Pubkey,
    pub authority: Pubkey,
}
