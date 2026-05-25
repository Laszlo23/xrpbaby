import type { Schema, Struct } from '@strapi/strapi';

export interface ProfileSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_profile_social_links';
  info: {
    displayName: 'SocialLink';
    icon: 'link';
  };
  attributes: {
    label: Schema.Attribute.String;
    platform: Schema.Attribute.Enumeration<
      [
        'twitter',
        'linkedin',
        'github',
        'discord',
        'telegram',
        'instagram',
        'youtube',
        'farcaster',
        'website',
        'other',
      ]
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'website'>;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProfileWalletLink extends Struct.ComponentSchema {
  collectionName: 'components_profile_wallet_links';
  info: {
    displayName: 'WalletLink';
    icon: 'chartBubble';
  };
  attributes: {
    address: Schema.Attribute.String & Schema.Attribute.Required;
    chain: Schema.Attribute.Enumeration<['evm', 'solana', 'sui', 'bitcoin']> &
      Schema.Attribute.Required;
    label: Schema.Attribute.String;
    verifiedAt: Schema.Attribute.DateTime;
  };
}

export interface SharedMedia extends Struct.ComponentSchema {
  collectionName: 'components_shared_media';
  info: {
    displayName: 'Media';
    icon: 'file-video';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files' | 'videos'>;
  };
}

export interface SharedQuote extends Struct.ComponentSchema {
  collectionName: 'components_shared_quotes';
  info: {
    displayName: 'Quote';
    icon: 'indent';
  };
  attributes: {
    body: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: '';
    displayName: 'Rich text';
    icon: 'align-justify';
  };
  attributes: {
    body: Schema.Attribute.RichText;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: '';
    displayName: 'Seo';
    icon: 'allergies';
    name: 'Seo';
  };
  attributes: {
    metaDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    metaTitle: Schema.Attribute.String & Schema.Attribute.Required;
    shareImage: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedSlider extends Struct.ComponentSchema {
  collectionName: 'components_shared_sliders';
  info: {
    description: '';
    displayName: 'Slider';
    icon: 'address-book';
  };
  attributes: {
    files: Schema.Attribute.Media<'images', true>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'profile.social-link': ProfileSocialLink;
      'profile.wallet-link': ProfileWalletLink;
      'shared.media': SharedMedia;
      'shared.quote': SharedQuote;
      'shared.rich-text': SharedRichText;
      'shared.seo': SharedSeo;
      'shared.slider': SharedSlider;
    }
  }
}
